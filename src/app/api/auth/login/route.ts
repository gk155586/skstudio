import { NextResponse } from "next/server";
import { atomicDb } from "@/app/lib/db";
import { hashPassword, verifyPassword } from "@/app/lib/auth";
import { signJWT } from "@/app/lib/jwt";

export const dynamic = "force-dynamic";

function normalizeUsers(usersRaw: any): Record<string, any> {
  if (!usersRaw || typeof usersRaw !== "object") return {};
  if (Array.isArray(usersRaw)) {
    const record: Record<string, any> = {};
    usersRaw.forEach((u: any, idx: number) => {
      if (u && (u.id || u.email)) {
        record[u.id || u.email] = u;
      } else if (u) {
        record[`user_${idx}`] = u;
      }
    });
    return record;
  }
  return usersRaw;
}

function getUsers(): Record<string, any> {
  const raw = atomicDb.readJson("users.json", {});
  return normalizeUsers(raw);
}

async function saveUsers(users: Record<string, any>) {
  await atomicDb.writeJson("users.json", users);
}

// Only these exact identifiers are treated as admin
const ADMIN_EMAILS = ["ganeshkalapadgk@gmail.com", "admin"];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email or mobile number and password are required" },
        { status: 400 }
      );
    }

    const cleanInput = email.trim().toLowerCase();
    const digitsInput = cleanInput.replace(/\D/g, "");
    const users = getUsers();

    const isAdminAttempt = ADMIN_EMAILS.includes(cleanInput);

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
      await saveUsers(users);
    }

    // 2. Find user in database by Email, Mobile/Phone, or User ID
    let userEntry = Object.entries(users).find(([_, user]: [string, any]) => {
      if (!user) return false;
      const uEmail = (user.email || "").toLowerCase();
      const uId = (user.id || "").toLowerCase();
      const uPhone = (user.phone || user.mobile || "").replace(/\D/g, "");

      if (uEmail === cleanInput || uId === cleanInput) return true;
      if (digitsInput.length >= 7 && uPhone.length >= 7 && uPhone.endsWith(digitsInput)) return true;
      return false;
    });

    if (!userEntry && isAdminAttempt) {
      userEntry = ["admin", users["admin"]];
    }

    if (!userEntry) {
      return NextResponse.json(
        { success: false, message: "Invalid email/mobile or password" },
        { status: 401 }
      );
    }

    const [userId, user] = userEntry as [string, any];

    // 3. Verify or claim password
    let passwordMatch = false;

    if (!user.password) {
      // Seed user or guest account created without password -> set password on first login
      user.password = hashPassword(password);
      users[userId] = user;
      await saveUsers(users);
      passwordMatch = true;
    } else {
      try {
        passwordMatch = verifyPassword(password, user.password);
      } catch (err) {
        passwordMatch = false;
      }
    }

    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid email/mobile or password" },
        { status: 401 }
      );
    }

    if (user.isActive === false) {
      return NextResponse.json(
        { success: false, message: "Your account is suspended. Please contact studio support." },
        { status: 403 }
      );
    }

    const effectiveRole = isAdminAttempt ? "admin" : (user.role || "user");

    // Update last active timestamp
    user.lastActiveAt = new Date().toISOString();
    users[userId] = user;
    await saveUsers(users);

    const sessionObj = {
      userId: isAdminAttempt ? "admin" : userId,
      email: user.email || cleanInput,
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
