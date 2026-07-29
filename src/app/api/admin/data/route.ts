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
    const payload = await verifyJWT(jwtCookie.value);
    if (payload && payload.role === "admin") return payload;
  }

  if (sessionCookie?.value) {
    try {
      const session = JSON.parse(sessionCookie.value);
      if (session && session.role === "admin") return session;
    } catch {}
  }

  return null;
}

export async function GET() {
  try {
    // 1. Verify Admin Session Cookie
    const session = await verifyAdminAuth();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized: Administrator access required" }, { status: 401 });
    }

    // 2. Read Databases
    let bookings = readJsonFile("bookings.json", []);
    const packages = readJsonFile("packages.json", []);
    const usersRaw = readJsonFile("users.json", {});
    const coupons = readJsonFile("coupons.json", []);
    const orders = readJsonFile("orders.json", []);
    const reviews = readJsonFile("reviews.json", []);
    let enquiries = readJsonFile("enquiries.json", []);
    const content = readJsonFile("content.json", {});
    const auditLogs = readJsonFile("audit_logs.json", []);
    const messages = readJsonFile("messages.json", []);
    
    // Filter soft deleted records
    bookings = Array.isArray(bookings) ? bookings.filter((b: any) => !b.isDeleted) : [];
    enquiries = Array.isArray(enquiries) ? enquiries.filter((e: any) => !e.isDeleted) : [];

    // Sort bookings by creation date descending
    bookings.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    
    // Sort audit logs by timestamp descending (newest first)
    if (Array.isArray(auditLogs)) {
      auditLogs.sort((a: any, b: any) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
    }

    // Process users to hide hashes and provide clean listing
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

    // Load crew from content database
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
