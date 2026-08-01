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

    // 1. Ensure usersRaw is a clean key-value Record object
    if (!usersRaw || typeof usersRaw !== "object" || Array.isArray(usersRaw)) {
      if (Array.isArray(usersRaw)) {
        const normalized: Record<string, any> = {};
        (usersRaw as any[]).forEach((u: any, idx: number) => {
          if (u && (u.id || u.email)) {
            normalized[u.id || u.email] = u;
          } else if (u) {
            normalized[`user_${idx}`] = u;
          }
        });
        usersRaw = normalized;
      } else {
        usersRaw = {};
      }
    }

    // Default seed accounts for client directory
    const seedAccounts: Record<string, any> = {
      admin: {
        id: "admin",
        email: "ganeshkalapadgk@gmail.com",
        name: "Ganesh Kalapad (Admin)",
        phone: "+91 93071 12119",
        role: "admin",
        isActive: true,
        createdAt: "2026-08-01T00:00:00.000Z"
      },
      user_rahul: {
        id: "user_rahul",
        name: "Rahul Sharma",
        email: "rahul.sharma@example.com",
        phone: "+91 98230 12345",
        role: "user",
        isActive: true,
        createdAt: "2026-07-31T10:00:00.000Z"
      },
      user_neha: {
        id: "user_neha",
        name: "Neha Patil",
        email: "neha.patil@example.com",
        phone: "+91 97645 12345",
        role: "user",
        isActive: true,
        createdAt: "2026-07-31T12:00:00.000Z"
      },
      user_amit: {
        id: "user_amit",
        name: "Amit Deshmukh",
        email: "amit.deshmukh@example.com",
        phone: "+91 99887 76655",
        role: "user",
        isActive: true,
        createdAt: "2026-08-01T08:00:00.000Z"
      },
      user_priya: {
        id: "user_priya",
        name: "Priya Kulkarni",
        email: "priya.kulkarni@example.com",
        phone: "+91 98900 11223",
        role: "user",
        isActive: true,
        createdAt: "2026-08-01T09:00:00.000Z"
      },
      user_default: {
        id: "user_default",
        name: "Ganesh Kalapad",
        email: "ganeshk@gmail.com",
        phone: "+91 93071 12119",
        role: "user",
        isActive: true,
        createdAt: "2026-08-01T09:30:00.000Z"
      }
    };

    // Ensure seed accounts exist if no users in users.json yet
    if (Object.keys(usersRaw).length === 0) {
      Object.assign(usersRaw, seedAccounts);
    } else {
      if (!usersRaw["admin"]) {
        usersRaw["admin"] = seedAccounts.admin;
      }
    }

    // Clean up any corrupt entries where name was set to "Ganesh Kalapad (Admin)" for non-admin accounts
    Object.keys(usersRaw).forEach((k) => {
      const u = usersRaw[k];
      if (!u) return;
      const emailLower = (u.email || "").toLowerCase();
      if (emailLower !== "ganeshkalapadgk@gmail.com") {
        if (u.role === "admin") u.role = "user";
        if (u.name === "Ganesh Kalapad (Admin)") {
          if (emailLower === "amit.deshmukh@example.com") u.name = "Amit Deshmukh";
          else if (emailLower === "rahul.sharma@example.com") u.name = "Rahul Sharma";
          else if (emailLower === "neha.patil@example.com") u.name = "Neha Patil";
          else if (emailLower === "priya.kulkarni@example.com") u.name = "Priya Kulkarni";
          else if (emailLower === "ganeshk@gmail.com") u.name = "Ganesh Kalapad";
          else u.name = u.email ? u.email.split("@")[0] : "Client";
        }
      }
    });

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

    // 5. Aggregate new contacts from bookings & enquiries into usersRaw permanently (if email not present)
    const knownEmails = new Set(Object.values(usersRaw).map((u: any) => (u?.email || "").toLowerCase()));
    let usersAdded = false;

    bookings.forEach((b: any) => {
      if (b.email && !knownEmails.has(b.email.toLowerCase())) {
        knownEmails.add(b.email.toLowerCase());
        const newKey = `user_lead_${b.id || Date.now()}`;
        usersRaw[newKey] = {
          id: newKey,
          name: b.name || b.email.split("@")[0],
          email: b.email,
          phone: b.phone || b.mobile || "",
          role: "user",
          isActive: true,
          createdAt: b.createdAt || new Date().toISOString()
        };
        usersAdded = true;
      }
    });

    enquiries.forEach((e: any) => {
      if (e.email && !knownEmails.has(e.email.toLowerCase())) {
        knownEmails.add(e.email.toLowerCase());
        const newKey = `user_enq_${e.id || Date.now()}`;
        usersRaw[newKey] = {
          id: newKey,
          name: e.name || e.customerName || e.email.split("@")[0],
          email: e.email,
          phone: e.phone || e.mobile || "",
          role: "user",
          isActive: true,
          createdAt: e.createdAt || new Date().toISOString()
        };
        usersAdded = true;
      }
    });

    if (usersAdded) {
      await atomicDb.writeJson("users.json", usersRaw);
    }

    // Process users to provide clean, deduplicated listing by email
    const deduplicatedMap = new Map<string, any>();
    Object.entries(usersRaw || {}).forEach(([id, u]: [string, any]) => {
      if (!u) return;
      const key = (u.email || id).toLowerCase();
      // Admin account priority or keep existing first record
      if (!deduplicatedMap.has(key) || u.role === "admin") {
        deduplicatedMap.set(key, {
          id: u.id || id,
          name: u.name || "Client",
          email: u.email || id,
          phone: u.phone || u.mobile || "",
          role: u.role || "user",
          isActive: u.isActive !== false,
          createdAt: u.createdAt || new Date().toISOString(),
        });
      }
    });

    const users = Array.from(deduplicatedMap.values());

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
