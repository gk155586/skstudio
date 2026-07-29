import { NextResponse } from "next/server";
import { hashPassword, verifyPassword } from "@/app/lib/auth";
import { atomicDb } from "@/app/lib/db";
import { signJWT } from "@/app/lib/jwt";
import { sseHub } from "@/app/lib/sse";

export const dynamic = "force-dynamic";

function getUsers() {
  return atomicDb.readJson("users.json", {});
}

async function saveUsers(users: any) {
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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
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
    const cleanEmail = email.trim().toLowerCase();

    // Check if email already exists
    const existingUserEntry = Object.entries(users).find(
      ([_, user]: [string, any]) => user.email?.toLowerCase() === cleanEmail
    );

    if (existingUserEntry) {
      const [existingId, existingUser] = existingUserEntry as [string, any];

      // Email exists - verify password
      if (existingUser.password) {
        let passwordMatch = false;
        try {
          passwordMatch = verifyPassword(password, existingUser.password);
        } catch (err) {
          console.log("Password check fallback for existing user");
          passwordMatch = false;
        }

        if (passwordMatch) {
          const userObj = {
            userId: existingId,
            email: existingUser.email,
            name: existingUser.name,
            role: existingUser.role || "user",
          };

          const token = await signJWT(userObj, 30 * 24 * 60 * 60 * 1000);

          const response = NextResponse.json({
            success: true,
            message: "Logged in with existing account",
            user: {
              id: existingId,
              email: existingUser.email,
              name: existingUser.name,
              role: existingUser.role || "user",
            },
          });

          // Set 30-day persistent session cookies
          response.cookies.set("sk_session", JSON.stringify(userObj), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 30 * 24 * 60 * 60,
          });

          response.cookies.set("sk_session_jwt", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 30 * 24 * 60 * 60,
          });

          return response;
        } else {
          return NextResponse.json(
            {
              success: false,
              message: "An account with this email already exists. Password incorrect.",
            },
            { status: 400 }
          );
        }
      }
    }

    // New user registration
    const hashedPassword = hashPassword(password);
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const cleanMobile = mobile.trim();

    const newUser = {
      name: name.trim(),
      email: cleanEmail,
      phone: cleanMobile,
      mobile: cleanMobile,
      password: hashedPassword,
      role: "user",
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    users[userId] = newUser;
    await saveUsers(users);

    const userSessionObj = {
      userId,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    };

    const token = await signJWT(userSessionObj, 30 * 24 * 60 * 60 * 1000);

    const response = NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        user: {
          id: userId,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          phone: newUser.phone,
        },
      },
      { status: 201 }
    );

    // Set 30-day persistent cookies (both sk_session and sk_session_jwt)
    response.cookies.set("sk_session", JSON.stringify(userSessionObj), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    response.cookies.set("sk_session_jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    // Broadcast SSE to update admin dashboard in real-time
    sseHub.broadcast("data_changed", {
      type: "new_user",
      data: {
        id: userId,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        createdAt: newUser.createdAt,
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
