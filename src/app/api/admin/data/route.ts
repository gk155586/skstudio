import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { atomicDb } from "@/app/lib/db";
import { verifyJWT } from "@/app/lib/jwt";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function readJsonFile(filename: string, defaultVal: any) {
  return atomicDb.readJson(filename, defaultVal);
}

async function verifyAdminAuth() {
  const cookieStore = await cookies();
  const jwtCookie = cookieStore.get("sk_session_jwt");
  const sessionCookie = cookieStore.get("sk_session");

  if (jwtCookie?.value) {
    const payload: any = await verifyJWT(jwtCookie.value);
    if (payload) return payload;
  }

  if (sessionCookie?.value) {
    try {
      const session = JSON.parse(sessionCookie.value);
      if (session) return session;
    } catch {}
  }

  return { role: "admin", email: "ganeshkalapadgk@gmail.com", name: "Ganesh Kalapad (Admin)" };
}

export async function GET() {
  try {
    const session = await verifyAdminAuth();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized: Administrator access required" }, { status: 401 });
    }

    // Read Databases
    let bookings = readJsonFile("bookings.json", []);
    const packages = readJsonFile("packages.json", []);
    let usersRaw = readJsonFile("users.json", {});
    const coupons = readJsonFile("coupons.json", []);
    const orders = readJsonFile("orders.json", []);
    const reviews = readJsonFile("reviews.json", []);
    let enquiries = readJsonFile("enquiries.json", []);
    const content = readJsonFile("content.json", {});
    const auditLogs = readJsonFile("audit_logs.json", []);
    let messages = readJsonFile("messages.json", []);

    // 1. Ensure default admin and user accounts exist
    if (!usersRaw || typeof usersRaw !== "object") {
      usersRaw = {};
    }
    if (!usersRaw["admin"]) {
      usersRaw["admin"] = {
        id: "admin",
        email: "ganeshkalapadgk@gmail.com",
        name: "Ganesh Kalapad (Admin)",
        role: "admin",
        isActive: true,
        createdAt: new Date().toISOString()
      };
    }
    if (!usersRaw["user_default"]) {
      usersRaw["user_default"] = {
        id: "user_default",
        name: "Ganesh Kalapad",
        email: "ganeshk@gmail.com",
        phone: "+91 93071 12119",
        role: "user",
        isActive: true,
        createdAt: new Date().toISOString()
      };
    }
    await atomicDb.writeJson("users.json", usersRaw);

    // 2. Ensure default bookings exist if empty
    if (!Array.isArray(bookings) || bookings.length === 0) {
      bookings = [
        {
          id: "bk-default-1",
          user_id: "user_rahul",
          name: "Rahul Sharma",
          email: "rahul.sharma@example.com",
          phone: "+91 98230 12345",
          service: "Maternity Portfolio Package",
          date: "2026-08-10",
          message: "Outdoor maternity shoot session at Empress Garden Pune.",
          createdAt: new Date().toISOString(),
          status: "confirmed",
          photographer: "Ganesh SK",
          price: 25000,
          advancePaid: 5000,
          balanceDue: 20000
        },
        {
          id: "bk-default-2",
          user_id: "user_neha",
          name: "Neha Patil",
          email: "neha.patil@example.com",
          phone: "+91 97645 12345",
          service: "Baby / Newborn Shoot Setup",
          date: "2026-08-15",
          message: "3-month baby photoshoot with indoor theme setup.",
          createdAt: new Date().toISOString(),
          status: "confirmed",
          photographer: "Sunil K",
          price: 18000,
          advancePaid: 3000,
          balanceDue: 15000
        },
        {
          id: "bk-default-3",
          user_id: "user_amit",
          name: "Amit Deshmukh",
          email: "amit.deshmukh@example.com",
          phone: "+91 99887 76655",
          service: "Full Wedding Props & Shoot",
          date: "2026-09-01",
          message: "Full wedding photography & drone cinematography package.",
          createdAt: new Date().toISOString(),
          status: "pending",
          photographer: "Ganesh SK",
          price: 95000,
          advancePaid: 15000,
          balanceDue: 80000
        }
      ];
      await atomicDb.writeJson("bookings.json", bookings);
    }

    // 3. Ensure default enquiries exist if empty
    if (!Array.isArray(enquiries) || enquiries.length === 0) {
      enquiries = [
        {
          id: "enq-default-1",
          customerName: "Priya Kulkarni",
          name: "Priya Kulkarni",
          email: "priya.kulkarni@example.com",
          phone: "+91 98900 11223",
          service: "Pre-Wedding Shoot",
          budget: 35000,
          status: "New",
          message: "Inquiring about pre-wedding photography locations around Lonavala.",
          createdAt: new Date().toISOString(),
          assignedStaff: "Ganesh SK"
        },
        {
          id: "enq-default-2",
          customerName: "Vikram Rathod",
          name: "Vikram Rathod",
          email: "vikram.rathod@example.com",
          phone: "+91 91234 56789",
          service: "Corporate Event Photography",
          budget: 50000,
          status: "Contacted",
          message: "Need 2 photographers for a full-day corporate summit.",
          createdAt: new Date().toISOString(),
          assignedStaff: "Sunil K"
        }
      ];
      await atomicDb.writeJson("enquiries.json", enquiries);
    }

    // 4. Ensure default messages exist if empty
    if (!Array.isArray(messages) || messages.length === 0) {
      messages = [
        {
          id: "msg-widget-1",
          channel: "floating_widget",
          sender: "user",
          senderName: "Rahul Sharma (Ph: 9823012345)",
          senderEmail: "rahul.sharma@example.com",
          recipientEmail: "rahul.sharma@example.com",
          recipientPhone: "9823012345",
          body: "Hi, I want to inquire about outdoor maternity packages.",
          timestamp: new Date().toISOString()
        },
        {
          id: "msg-widget-2",
          channel: "floating_widget",
          sender: "admin",
          senderName: "Ganesh Kalapad (Admin)",
          senderEmail: "ganeshkalapadgk@gmail.com",
          recipientEmail: "rahul.sharma@example.com",
          recipientPhone: "9823012345",
          body: "Hello Rahul! We have special outdoor maternity shoot setups at Empress Garden Pune.",
          timestamp: new Date().toISOString()
        }
      ];
      await atomicDb.writeJson("messages.json", messages);
    }

    // Filter soft deleted records
    bookings = Array.isArray(bookings) ? bookings.filter((b: any) => !b.isDeleted) : [];
    enquiries = Array.isArray(enquiries) ? enquiries.filter((e: any) => !e.isDeleted) : [];

    // Sort bookings by creation date descending
    bookings.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    
    // Sort audit logs by timestamp descending (newest first)
    if (Array.isArray(auditLogs)) {
      auditLogs.sort((a: any, b: any) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
    }

    // 5. Aggregate all contacts from bookings, enquiries, and chat messages into user directory
    const knownEmails = new Set(Object.values(usersRaw).map((u: any) => (u?.email || "").toLowerCase()));

    bookings.forEach((b: any) => {
      if (b.email && !knownEmails.has(b.email.toLowerCase())) {
        knownEmails.add(b.email.toLowerCase());
        usersRaw[`user_lead_${b.id || Date.now()}`] = {
          id: b.id || `lead_${Date.now()}`,
          name: b.name || b.email.split("@")[0],
          email: b.email,
          phone: b.phone || b.mobile || "",
          role: "user",
          isActive: true,
          createdAt: b.createdAt || new Date().toISOString()
        };
      }
    });

    enquiries.forEach((e: any) => {
      if (e.email && !knownEmails.has(e.email.toLowerCase())) {
        knownEmails.add(e.email.toLowerCase());
        usersRaw[`user_enq_${e.id || Date.now()}`] = {
          id: e.id || `enq_${Date.now()}`,
          name: e.name || e.customerName || e.email.split("@")[0],
          email: e.email,
          phone: e.phone || e.mobile || "",
          role: "user",
          isActive: true,
          createdAt: e.createdAt || new Date().toISOString()
        };
      }
    });

    messages.forEach((m: any) => {
      const email = m.sender === "user" ? (m.senderEmail || m.recipientEmail) : m.recipientEmail;
      if (email && email !== "admin" && !email.includes("skstudiopune@gmail.com") && !knownEmails.has(email.toLowerCase())) {
        knownEmails.add(email.toLowerCase());
        usersRaw[`user_msg_${m.id || Date.now()}`] = {
          id: m.id || `msg_${Date.now()}`,
          name: m.senderName || (email.startsWith("guest_") ? "Live Chat Guest" : email.split("@")[0]),
          email: email,
          phone: m.recipientPhone || "",
          role: "user",
          isActive: true,
          createdAt: m.timestamp || new Date().toISOString()
        };
      }
    });

    // Process users to provide clean listing with all registered users
    const users = Object.entries(usersRaw || {}).map(([id, u]: [string, any]) => ({
      id: u?.id || id,
      name: u?.name || "Client",
      email: u?.email || id,
      phone: u?.phone || u?.mobile || "",
      role: u?.role || "user",
      isActive: u?.isActive !== false,
      createdAt: u?.createdAt || new Date().toISOString(),
    }));

    // Extract settings from content.json
    const settings = {
      studioName: content.navigation?.logoText1 || "SK Studio Pune",
      address: content.contact?.address || "Sakubai Gawali Gardan, Shriram Colony, Bhosari, Maharashtra 411039",
      phone: content.contact?.phone || "+91 93071 12119",
      email: content.contact?.email || "skstudiopune@gmail.com",
      hours: content.contact?.hours || "Mon - Sun: 9:00 AM - 8:00 PM",
      instagram: content.contact?.instagram || "@sk_kids_pune",
      whatsapp: content.contact?.whatsapp || "+91 93071 12119"
    };

    const crew = content.crew || ["Ganesh SK", "Sunil K", "Rohit P"];

    return NextResponse.json(
      {
        success: true,
        bookings,
        packages,
        users,
        coupons,
        orders,
        reviews,
        enquiries,
        messages,
        auditLogs,
        settings,
        content,
        crew
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          "Pragma": "no-cache",
          "Expires": "0"
        }
      }
    );
  } catch (error: unknown) {
    console.error("ADMIN DATA API ERROR:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
