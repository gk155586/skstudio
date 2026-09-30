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
const ADMIN_EMAILS = [
  "ganeshkalapadgk@gmail.com",
  "admin",
  "admin@skstudio.store",
  "skstudiopune@gmail.com",
  "9307112119",
  "+91 93071 12119",
  "+919307112119"
];

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

    const isAdminAttempt = ADMIN_EMAILS.includes(cleanInput) || (digitsInput.length >= 10 && digitsInput.endsWith("9307112119"));

    // 1. Dedicated, guaranteed Admin Authentication Branch
    if (isAdminAttempt) {
      const envAdminPw = process.env.ADMIN_PASSWORD || "#Ganesha@123";
      const isPasswordCorrect =
        password === "#Ganesha@123" ||
        password === "Ganesha@123" ||
        password === envAdminPw ||
        password === envAdminPw.replace(/^#/, "") ||
        `#${password}` === envAdminPw ||
        (users["admin"]?.password && verifyPassword(password, users["admin"].password));

      if (isPasswordCorrect) {
        // Guarantee admin user record exists
        const adminUser = {
          id: "admin",
          email: "ganeshkalapadgk@gmail.com",
          name: "Ganesh Kalapad (Admin)",
          phone: "+91 93071 12119",
          password: hashPassword("#Ganesha@123"),
          role: "admin",
          isActive: true,
          lastActiveAt: new Date().toISOString()
        };

        users["admin"] = adminUser;
        await saveUsers(users);

        const sessionObj = {
          userId: "admin",
          email: "ganeshkalapadgk@gmail.com",
          name: "Ganesh Kalapad (Admin)",
          phone: "+91 93071 12119",
          role: "admin",
        };

        const response = NextResponse.json({
          success: true,
          user: sessionObj,
        });

        // Set 30-day persistent session cookies
        response.cookies.set("sk_session", JSON.stringify(sessionObj), {
          httpOnly: true,
          sameSite: "lax",
          maxAge: 30 * 24 * 60 * 60,
          path: "/",
        });

        const token = await signJWT(sessionObj, 30 * 24 * 60 * 60 * 1000);
        response.cookies.set("sk_session_jwt", token, {
          httpOnly: true,
          sameSite: "lax",
          maxAge: 30 * 24 * 60 * 60,
          path: "/",
        });

        return response;
      } else {
        return NextResponse.json(
          { success: false, message: "Invalid email/mobile or password" },
          { status: 401 }
        );
      }
    }

    // 2. Standard Client User Authentication Branch
    const userEntry = Object.entries(users).find(([_, user]: [string, any]) => {
      if (!user) return false;
      const uEmail = (user.email || "").toLowerCase();
      const uId = (user.id || "").toLowerCase();
      const uPhone = (user.phone || user.mobile || "").replace(/\D/g, "");

      if (uEmail === cleanInput || uId === cleanInput) return true;
      if (digitsInput.length >= 7 && uPhone.length >= 7 && uPhone.endsWith(digitsInput)) return true;
      return false;
    });

    if (!userEntry) {
      return NextResponse.json(
        { success: false, message: "Invalid email/mobile or password" },
        { status: 401 }
      );
    }

    const [userId, user] = userEntry as [string, any];

    // 3. Verify or claim password for clients
    let passwordMatch = false;

    if (!user.password) {
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

    // Update last active timestamp
    user.lastActiveAt = new Date().toISOString();
    users[userId] = user;
    await saveUsers(users);

    const sessionObj = {
      userId,
      email: user.email || cleanInput,
      name: user.name || "User",
      phone: user.phone || user.mobile || "",
      role: user.role || "user",
    };

    const response = NextResponse.json({
      success: true,
      user: sessionObj,
    });

    response.cookies.set("sk_session", JSON.stringify(sessionObj), {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

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
