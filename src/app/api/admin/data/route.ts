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

    // Ensure admin account exists
    if (!usersRaw["admin"]) {
      usersRaw["admin"] = {
        id: "admin",
        email: "ganeshkalapadgk@gmail.com",
        name: "Ganesh Kalapad (Admin)",
        phone: "+91 93071 12119",
        role: "admin",
        isActive: true,
        createdAt: "2026-08-01T00:00:00.000Z"
      };
      await atomicDb.writeJson("users.json", usersRaw);
    }

    // Filter soft deleted records
    bookings = Array.isArray(bookings) ? bookings.filter((b: any) => !b.isDeleted) : [];
    enquiries = Array.isArray(enquiries) ? enquiries.filter((e: any) => !e.isDeleted) : [];
    messages = Array.isArray(messages) ? messages.filter((m: any) => !m.isDeleted) : [];

    // Sort bookings by creation date descending
    bookings.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    
    // Sort audit logs by timestamp descending (newest first)
    if (Array.isArray(auditLogs)) {
      auditLogs.sort((a: any, b: any) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
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
