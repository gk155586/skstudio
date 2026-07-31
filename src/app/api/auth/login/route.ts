import { NextResponse } from "next/server";
import { atomicDb } from "@/app/lib/db";
import { hashPassword, verifyPassword } from "@/app/lib/auth";
import { signJWT } from "@/app/lib/jwt";

export const dynamic = "force-dynamic";

function getUsers() {
  return atomicDb.readJson("users.json", {});
}

// Only these exact emails are treated as admin
const ADMIN_EMAILS = ["ganeshkalapadgk@gmail.com", "admin"];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const users = getUsers();

    const isAdminAttempt = ADMIN_EMAILS.includes(cleanEmail);

    // 1. First-time setup: create admin account if it doesn't exist yet
    if (isAdminAttempt && !users["admin"]?.password) {
      users["admin"] = {
        id: "admin",
        email: "ganeshkalapadgk@gmail.com",
        name: "Ganesh Kalapad (Admin)",
        password: hashPassword(password),
        role: "admin",
        isActive: true,
      };
      await atomicDb.writeJson("users.json", users);
    }

    // 2. Find user in database
    let userEntry = Object.entries(users).find(
      ([_, user]: [string, any]) =>
        user.email?.toLowerCase() === cleanEmail ||
        user.id?.toLowerCase() === cleanEmail
    );

    if (!userEntry && isAdminAttempt) {
      userEntry = ["admin", users["admin"]];
    }

    if (!userEntry) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const [userId, user] = userEntry as [string, any];

    // 3. Verify password for ALL users (including admin)
    let passwordMatch = false;
    try {
      passwordMatch = verifyPassword(password, user.password);
    } catch (err) {
      passwordMatch = false;
    }

    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const effectiveRole = isAdminAttempt ? "admin" : (user.role || "user");

    const sessionObj = {
      userId: isAdminAttempt ? "admin" : userId,
      email: user.email || cleanEmail,
      name: user.name || "User",
      phone: user.phone || user.mobile || "",
      role: effectiveRole,
    };

    // Create response with session data
    const response = NextResponse.json({
      success: true,
      user: sessionObj,
    });

    // Set 30-day persistent session cookie
    response.cookies.set("sk_session", JSON.stringify(sessionObj), {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    // Set 30-day persistent JWT session cookie
    const token = await signJWT(sessionObj, 30 * 24 * 60 * 60 * 1000);
    response.cookies.set("sk_session_jwt", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
