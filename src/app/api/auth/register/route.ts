import { NextResponse } from "next/server";
import { hashPassword, verifyPassword } from "@/app/lib/auth";
import { atomicDb } from "@/app/lib/db";
import { signJWT } from "@/app/lib/jwt";
import { sseHub } from "@/app/lib/sse";

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, mobile, password } = body;

    // Validate input
    if (!name || !email || !mobile || !password) {
      return NextResponse.json(
        { success: false, message: "All fields are required (name, email, mobile, password)" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanMobile = mobile.trim();
    const digitsMobile = cleanMobile.replace(/\D/g, "");

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const users = getUsers();

    // Check if email or mobile already exists
    const existingUserEntry = Object.entries(users).find(
      ([_, user]: [string, any]) => {
        const uEmail = (user.email || "").toLowerCase();
        const uPhone = (user.phone || user.mobile || "").replace(/\D/g, "");
        return (
          uEmail === cleanEmail ||
          (digitsMobile.length >= 7 && uPhone.length >= 7 && uPhone.endsWith(digitsMobile))
        );
      }
    );

    let userId: string;
    let userObjToSave: any;
    const hashedPassword = hashPassword(password);

    if (existingUserEntry) {
      const [existingId, existingUser] = existingUserEntry as [string, any];
      userId = existingId;

      // If user exists: update password to newly registered password so account is active & usable
      existingUser.password = hashedPassword;
      if (name.trim()) existingUser.name = name.trim();
      existingUser.email = cleanEmail;
      existingUser.phone = cleanMobile;
      existingUser.mobile = cleanMobile;
      existingUser.isActive = true;
      userObjToSave = existingUser;
    } else {
      // New user registration
      userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      userObjToSave = {
        id: userId,
        name: name.trim(),
        email: cleanEmail,
        phone: cleanMobile,
        mobile: cleanMobile,
        password: hashedPassword,
        role: "user",
        isActive: true,
        createdAt: new Date().toISOString(),
      };
    }

    users[userId] = userObjToSave;
    await saveUsers(users);

    const userSessionObj = {
      userId,
      email: userObjToSave.email,
      name: userObjToSave.name,
      phone: userObjToSave.phone || userObjToSave.mobile || "",
      role: userObjToSave.role || "user",
    };

    const token = await signJWT(userSessionObj, 30 * 24 * 60 * 60 * 1000);

    const response = NextResponse.json(
      {
        success: true,
        message: existingUserEntry ? "Account setup complete. Welcome!" : "Account created successfully",
        user: {
          id: userId,
          name: userObjToSave.name,
          email: userObjToSave.email,
          role: userObjToSave.role || "user",
          phone: userObjToSave.phone,
        },
      },
      { status: existingUserEntry ? 200 : 201 }
    );

    // Set 30-day persistent cookies (both sk_session and sk_session_jwt)
    response.cookies.set("sk_session", JSON.stringify(userSessionObj), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    response.cookies.set("sk_session_jwt", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    // Broadcast SSE to update admin dashboard in real-time
    sseHub.broadcast("data_changed", {
      type: "new_user",
      data: {
        id: userId,
        name: userObjToSave.name,
        email: userObjToSave.email,
        phone: userObjToSave.phone,
        role: userObjToSave.role || "user",
        createdAt: userObjToSave.createdAt || new Date().toISOString(),
      },
    });

    return response;
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create account" },
      { status: 500 }
    );
  }
}
