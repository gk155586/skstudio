import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sseHub } from "@/app/lib/sse";
import { atomicDb } from "@/app/lib/db";
import { backgroundQueue } from "@/app/lib/queue";
import { verifyJWT } from "@/app/lib/jwt";

export const dynamic = "force-dynamic";

function readJsonFile(filename: string, defaultVal: any) {
  return atomicDb.readJson(filename, defaultVal);
}

async function writeJsonFile(filename: string, content: any): Promise<boolean> {
  return await atomicDb.writeJson(filename, content);
}

function logAuditTrail(userEmail: string, action: string, details: any) {
  backgroundQueue.push(async () => {
    const logs = atomicDb.readJson("audit_logs.json", []);
    const newLog = {
      id: "audit-" + Date.now(),
      userEmail,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    logs.push(newLog);
    await atomicDb.writeJson("audit_logs.json", logs);
  });
}

async function verifyAdminAuth() {
  const cookieStore = await cookies();
  const jwtCookie = cookieStore.get("sk_session_jwt");
  const sessionCookie = cookieStore.get("sk_session");

  if (jwtCookie?.value) {
    const payload: any = await verifyJWT(jwtCookie.value);
    if (payload && (payload.role === "admin" || payload.email?.toLowerCase() === "ganeshkalapadgk@gmail.com")) {
      return payload;
    }
  }

  if (sessionCookie?.value) {
    try {
      const session = JSON.parse(sessionCookie.value);
      if (session && (session.role === "admin" || session.email?.toLowerCase() === "ganeshkalapadgk@gmail.com")) {
        return session;
      }
    } catch {}
  }

  return null;
}

export async function POST(request: Request) {
  try {
    // 1. Verify Admin Session
    const session = await verifyAdminAuth();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse Request
    const body = await request.json();
    const { action, data } = body;

    if (!action || !data) {
      return NextResponse.json({ success: false, message: "Missing action or data parameter" }, { status: 400 });
    }

    let success = false;
    let message = "";
    let updatedPayload: any = null;

    const normAction = (action || "").toLowerCase().trim();

    switch (normAction) {
      case "update_booking": {
        const bookings = readJsonFile("bookings.json", []);
        const idx = bookings.findIndex((b: any) => b.id === data.id);
        if (idx !== -1) {
          const price = data.price !== undefined ? Number(data.price) : Number(bookings[idx].price || 0);
          const advancePaid = data.advancePaid !== undefined ? Number(data.advancePaid) : Number(bookings[idx].advancePaid || 0);
          const balanceDue = Math.max(0, price - advancePaid);

          bookings[idx] = {
            ...bookings[idx],
            ...data,
            price,
            advancePaid,
            balanceDue,
            updatedAt: new Date().toISOString()
          };
          success = await writeJsonFile("bookings.json", bookings);
          updatedPayload = bookings[idx];
          message = "Booking updated successfully";
          logAuditTrail(session.email, "UPDATE_BOOKING", { bookingId: data.id, fields: Object.keys(data) });
        } else {
          message = "Booking not found";
        }
        break;
      }

      case "delete_booking": {
        const bookings = readJsonFile("bookings.json", []);
        const idx = bookings.findIndex((b: any) => b.id === data.id);
        if (idx !== -1) {
          bookings[idx].isDeleted = true;
          bookings[idx].deletedAt = new Date().toISOString();
          success = await writeJsonFile("bookings.json", bookings);
          updatedPayload = { id: data.id, isDeleted: true };
          message = "Booking soft deleted successfully";
          logAuditTrail(session.email, "DELETE_BOOKING", { bookingId: data.id });
        } else {
          message = "Booking not found";
        }
        break;
      }

      case "update_enquiry": {
        const enquiries = readJsonFile("enquiries.json", []);
        const idx = enquiries.findIndex((e: any) => e.id === data.id);
        if (idx !== -1) {
          enquiries[idx] = {
            ...enquiries[idx],
            ...data,
            updatedAt: new Date().toISOString()
          };
          success = await writeJsonFile("enquiries.json", enquiries);
          updatedPayload = enquiries[idx];
          message = "Enquiry updated successfully";
          logAuditTrail(session.email, "UPDATE_ENQUIRY", { enquiryId: data.id, status: data.status });
          sseHub.broadcast("data_changed", { type: "update_enquiry", data: updatedPayload });
        } else {
          if (data.id === "new" || !data.id) {
            const newEnq = {
              id: "enq-" + Date.now(),
              ...data,
              createdAt: new Date().toISOString(),
              status: data.status || "New"
            };
            enquiries.push(newEnq);
            success = await writeJsonFile("enquiries.json", enquiries);
            updatedPayload = newEnq;
            message = "New enquiry captured";
            logAuditTrail(session.email, "CREATE_ENQUIRY", { enquiryId: newEnq.id });
            sseHub.broadcast("data_changed", { type: "create_enquiry", data: updatedPayload });
          } else {
            message = "Enquiry not found";
          }
        }
        break;
      }

      case "delete_enquiry": {
        const enquiries = readJsonFile("enquiries.json", []);
        const idx = enquiries.findIndex((e: any) => e.id === data.id);
        if (idx !== -1) {
          enquiries[idx].isDeleted = true;
          enquiries[idx].deletedAt = new Date().toISOString();
          success = await writeJsonFile("enquiries.json", enquiries);
          updatedPayload = { id: data.id, isDeleted: true };
          message = "Enquiry soft deleted successfully";
          logAuditTrail(session.email, "DELETE_ENQUIRY", { enquiryId: data.id });
        } else {
          message = "Enquiry not found";
        }
        break;
      }

      case "convert_enquiry": {
        const enquiries = readJsonFile("enquiries.json", []);
        const enqIdx = enquiries.findIndex((e: any) => e.id === data.enquiryId);
        if (enqIdx !== -1) {
          const enq = enquiries[enqIdx];
          
          const bookings = readJsonFile("bookings.json", []);
          const newBooking = {
            id: "bk-" + Date.now(),
            user_id: enq.user_id || "guest",
            name: enq.name,
            email: enq.email,
            phone: enq.phone,
            service: data.service || enq.service || "Unspecified Shoot",
            date: data.date || new Date().toISOString().split("T")[0],
            message: enq.message || "Converted from lead pipeline",
            createdAt: new Date().toISOString(),
            status: "confirmed",
            photographer: data.photographer || "Unassigned",
            price: data.price || 0,
            advancePaid: data.advancePaid || 0,
            balanceDue: (data.price || 0) - (data.advancePaid || 0)
          };
          
          bookings.push(newBooking);
          enquiries[enqIdx].status = "Converted";
          enquiries[enqIdx].convertedBookingId = newBooking.id;
          enquiries[enqIdx].updatedAt = new Date().toISOString();

          const bSuccess = await writeJsonFile("bookings.json", bookings);
          const eSuccess = await writeJsonFile("enquiries.json", enquiries);
          
          success = bSuccess && eSuccess;
          updatedPayload = newBooking;
          message = "Enquiry successfully converted to confirmed booking";
          logAuditTrail(session.email, "CONVERT_ENQUIRY", { enquiryId: data.enquiryId, bookingId: newBooking.id });
          sseHub.broadcast("data_changed", { type: "convert_enquiry", data: updatedPayload });
        } else {
          message = "Enquiry not found";
        }
        break;
      }

      case "update_review": {
        const reviews = readJsonFile("reviews.json", []);
        const idx = reviews.findIndex((r: any) => r.id === data.id);
        if (idx !== -1) {
          reviews[idx].status = data.status;
          reviews[idx].moderatedAt = new Date().toISOString();
          success = await writeJsonFile("reviews.json", reviews);
          updatedPayload = reviews[idx];
          message = `Review status updated to ${data.status}`;
          logAuditTrail(session.email, "MODERATE_REVIEW", { reviewId: data.id, status: data.status });
        } else {
          const newReview = {
            id: "rv-" + Date.now(),
            name: data.name || "Anonymous",
            rating: data.rating || 5,
            comment: data.comment || "",
            service: data.service || "General",
            status: data.status || "approved",
            createdAt: new Date().toISOString()
          };
          reviews.push(newReview);
          success = await writeJsonFile("reviews.json", reviews);
          updatedPayload = newReview;
          message = "Review registered";
          logAuditTrail(session.email, "CREATE_REVIEW", { reviewId: newReview.id });
        }
        break;
      }

      case "manage_coupon": {
        const coupons = readJsonFile("coupons.json", []);
        if (data.action === "add") {
          const newCoupon = {
            id: "coupon-" + data.code.toLowerCase(),
            code: data.code.trim().toUpperCase(),
            type: data.type || "percentage",
            value: parseFloat(data.value) || 0,
            minPurchase: parseFloat(data.minPurchase) || 0,
            isActive: true
          };
          coupons.push(newCoupon);
          success = await writeJsonFile("coupons.json", coupons);
          updatedPayload = newCoupon;
          message = "Promo coupon added";
          logAuditTrail(session.email, "ADD_COUPON", { couponCode: newCoupon.code });
        } else if (data.action === "delete") {
          const filtered = coupons.filter((c: any) => c.id !== data.id);
          success = await writeJsonFile("coupons.json", filtered);
          message = "Promo coupon deleted";
          logAuditTrail(session.email, "DELETE_COUPON", { couponId: data.id });
        }
        break;
      }

      case "update_order": {
        const orders = readJsonFile("orders.json", []);
        const idx = orders.findIndex((o: any) => o.id === data.id);
        if (idx !== -1) {
          orders[idx].status = data.status;
          orders[idx].trackingNumber = data.trackingNumber || orders[idx].trackingNumber || "";
          orders[idx].updatedAt = new Date().toISOString();
          success = await writeJsonFile("orders.json", orders);
          updatedPayload = orders[idx];
          message = "Physical product order status updated";
          logAuditTrail(session.email, "UPDATE_ORDER", { orderId: data.id, status: data.status });
        } else {
          message = "Order not found";
        }
        break;
      }

      case "save_settings": {
        const content = readJsonFile("content.json", {});
        if (!content.navigation) content.navigation = {};
        if (!content.contact) content.contact = {};
        
        content.navigation.logoText1 = data.studioName || content.navigation.logoText1;
        content.contact.address = data.address || content.contact.address;
        content.contact.phone = data.phone || content.contact.phone;
        content.contact.email = data.email || content.contact.email;
        content.contact.hours = data.hours || content.contact.hours;
        content.contact.instagram = data.instagram || content.contact.instagram;
        content.contact.whatsapp = data.whatsapp || content.contact.whatsapp;

        success = await writeJsonFile("content.json", content);
        updatedPayload = data;
        message = "Studio settings updated successfully";
        logAuditTrail(session.email, "SAVE_SETTINGS", { keys: Object.keys(data) });
        break;
      }

      case "save_content": {
        success = await writeJsonFile("content.json", data);
        updatedPayload = data;
        message = "Website content and categories updated successfully";
        logAuditTrail(session.email, "SAVE_CONTENT", { status: "Success" });
        break;
      }

      case "manage_crew": {
        const content = readJsonFile("content.json", {});
        if (!content.crew) {
          content.crew = ["Ganesh SK", "Sunil K", "Rohit P"];
        }
        
        if (data.action === "add") {
          const newName = data.name.trim();
          if (newName && !content.crew.includes(newName)) {
            content.crew.push(newName);
            success = await writeJsonFile("content.json", content);
            updatedPayload = content.crew;
            message = `Crew member ${newName} added successfully`;
            logAuditTrail(session.email, "ADD_CREW", { crewName: newName });
          } else {
            message = "Crew member already exists or empty name";
          }
        } else if (data.action === "update") {
          const oldName = data.oldName.trim();
          const newName = data.newName.trim();
          const idx = content.crew.indexOf(oldName);
          if (idx !== -1 && newName && !content.crew.includes(newName)) {
            content.crew[idx] = newName;
            
            // Also update any bookings/enquiries referencing this crew!
            const bookings = readJsonFile("bookings.json", []);
            bookings.forEach((b: any) => {
              if (b.photographer === oldName) b.photographer = newName;
            });
            await writeJsonFile("bookings.json", bookings);

            const enquiries = readJsonFile("enquiries.json", []);
            enquiries.forEach((e: any) => {
              if (e.assignedStaff === oldName) e.assignedStaff = newName;
            });
            await writeJsonFile("enquiries.json", enquiries);

            success = await writeJsonFile("content.json", content);
            updatedPayload = content.crew;
            message = `Crew member updated from ${oldName} to ${newName}`;
            logAuditTrail(session.email, "UPDATE_CREW", { oldName, newName });
          } else {
            message = "Crew name invalid or already exists";
          }
        } else if (data.action === "delete") {
          const nameToDelete = data.name.trim();
          content.crew = content.crew.filter((c: string) => c !== nameToDelete);
          success = await writeJsonFile("content.json", content);
          updatedPayload = content.crew;
          message = `Crew member ${nameToDelete} deleted successfully`;
          logAuditTrail(session.email, "DELETE_CREW", { crewName: nameToDelete });
        }
        break;
      }

      case "update_user":
      case "user_update":
      case "toggle_user":
      case "suspend_user":
      case "update_user_status": {
        const usersRaw = readJsonFile("users.json", {});
        const users: Record<string, any> = {};
        if (Array.isArray(usersRaw)) {
          usersRaw.forEach((u: any, idx: number) => {
            if (u && (u.id || u.email)) {
              users[u.id || u.email] = u;
            } else if (u) {
              users[`user_${idx}`] = u;
            }
          });
        } else if (usersRaw && typeof usersRaw === "object") {
          Object.assign(users, usersRaw);
        }

        const targetId = (data.id || data.email || "").toLowerCase();
        let userEntry = Object.entries(users).find(
          ([key, u]: [string, any]) =>
            key.toLowerCase() === targetId ||
            (u.email || "").toLowerCase() === targetId ||
            (u.id || "").toLowerCase() === targetId
        );

        if (!userEntry) {
          // Fallback: create record if user in list was from bookings/enquiries
          const newKey = data.id || `user_${Date.now()}`;
          users[newKey] = {
            id: newKey,
            email: data.email || targetId,
            name: data.name || data.email || "Client",
            phone: data.phone || data.mobile || "",
            role: "user",
            isActive: data.isActive !== undefined ? data.isActive : true,
            createdAt: new Date().toISOString()
          };
          userEntry = [newKey, users[newKey]];
        }

        const [matchedKey, existingUser] = userEntry;
        users[matchedKey] = {
          ...existingUser,
          ...data,
          updatedAt: new Date().toISOString()
        };
        success = await writeJsonFile("users.json", users);
        updatedPayload = users[matchedKey];
        message = "User account status updated successfully";
        logAuditTrail(session.email, "UPDATE_USER", { userId: matchedKey, fields: Object.keys(data) });
        break;
      }

      case "delete_user":
      case "user_delete":
      case "remove_user": {
        const usersRaw = readJsonFile("users.json", {});
        const users: Record<string, any> = {};
        if (Array.isArray(usersRaw)) {
          usersRaw.forEach((u: any, idx: number) => {
            if (u && (u.id || u.email)) {
              users[u.id || u.email] = u;
            } else if (u) {
              users[`user_${idx}`] = u;
            }
          });
        } else if (usersRaw && typeof usersRaw === "object") {
          Object.assign(users, usersRaw);
        }

        const targetId = (data.id || data.email || "").toLowerCase();
        const userEntries = Object.entries(users).filter(
          ([key, u]: [string, any]) =>
            key.toLowerCase() === targetId ||
            (u.email || "").toLowerCase() === targetId ||
            (u.id || "").toLowerCase() === targetId
        );

        if (userEntries.length > 0) {
          const isAdminDelete = userEntries.some(([key, u]) => u.role === "admin" || key === "admin");
          if (isAdminDelete) {
            message = "Cannot delete primary administrator account";
          } else {
            let targetEmail = "";
            userEntries.forEach(([key, u]) => {
              targetEmail = u.email || targetEmail;
              delete users[key];
            });

            success = await writeJsonFile("users.json", users);

            // Also clean up any message threads associated with deleted user
            if (targetEmail) {
              const messages = readJsonFile("messages.json", []);
              const cleanedMsgs = messages.filter(
                (m: any) =>
                  (m.senderEmail || "").toLowerCase() !== targetEmail.toLowerCase() &&
                  (m.recipientEmail || "").toLowerCase() !== targetEmail.toLowerCase()
              );
              await writeJsonFile("messages.json", cleanedMsgs);
            }

            updatedPayload = { id: targetId, isDeleted: true };
            message = "User account and linked records deleted successfully";
            logAuditTrail(session.email, "DELETE_USER", { userId: targetId });
          }
        } else {
          // Clean fallback if target email was passed
          if (targetId && targetId !== "admin") {
            const messages = readJsonFile("messages.json", []);
            const cleanedMsgs = messages.filter(
              (m: any) =>
                (m.senderEmail || "").toLowerCase() !== targetId &&
                (m.recipientEmail || "").toLowerCase() !== targetId
            );
            await writeJsonFile("messages.json", cleanedMsgs);
          }
          success = true;
          updatedPayload = { id: targetId, isDeleted: true };
          message = "User account removed";
        }
        break;
      }

      case "delete_message_thread":
      case "delete_chat": {
        const targetEmail = (data.email || data.id || "").toLowerCase().trim();
        if (targetEmail) {
          const messages = readJsonFile("messages.json", []);
          const cleanedMsgs = messages.filter(
            (m: any) =>
              (m.senderEmail || "").toLowerCase() !== targetEmail &&
              (m.recipientEmail || "").toLowerCase() !== targetEmail &&
              m.id !== data.id
          );
          success = await writeJsonFile("messages.json", cleanedMsgs);
          updatedPayload = { email: targetEmail, isDeleted: true };
          message = "Message thread deleted successfully";
          logAuditTrail(session.email, "DELETE_MESSAGE_THREAD", { threadEmail: targetEmail });
        } else {
          message = "Invalid thread target email";
        }
        break;
      }

      default: {
        message = `Invalid update action specified: ${action}`;
        break;
      }
    }

    if (success) {
      // 3. Broadcast Event to All Open SSE Client Connections
      sseHub.broadcast("data_changed", { action, data: updatedPayload });
      return NextResponse.json({ success: true, message, data: updatedPayload });
    } else {
      return NextResponse.json({ success: false, message: message || "Failed to save data changes" }, { status: 500 });
    }
  } catch (error: unknown) {
    console.error("ADMIN UPDATE API ERROR:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
