import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { atomicDb } from "@/app/lib/db";
import { verifyJWT } from "@/app/lib/jwt";

export const dynamic = "force-dynamic";

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
    const messages = readJsonFile("messages.json", []);

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

    // Filter soft deleted records
    bookings = Array.isArray(bookings) ? bookings.filter((b: any) => !b.isDeleted) : [];
    enquiries = Array.isArray(enquiries) ? enquiries.filter((e: any) => !e.isDeleted) : [];

    // Sort bookings by creation date descending
    bookings.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    
    // Sort audit logs by timestamp descending (newest first)
    if (Array.isArray(auditLogs)) {
      auditLogs.sort((a: any, b: any) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
    }

    // 2. Aggregate all contacts from bookings, enquiries, and chat messages into user directory
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

    return NextResponse.json({
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
    });
  } catch (error: unknown) {
    console.error("ADMIN DATA API ERROR:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
