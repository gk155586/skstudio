import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { atomicDb } from "@/app/lib/db";
import { sseHub } from "@/app/lib/sse";
import { verifyJWT } from "@/app/lib/jwt";

export const dynamic = "force-dynamic";

function getMessages() {
  return atomicDb.readJson("messages.json", []);
}

async function saveMessages(messages: any[]) {
  return await atomicDb.writeJson("messages.json", messages);
}

async function getUserSession() {
  const cookieStore = await cookies();
  const jwtCookie = cookieStore.get("sk_session_jwt");
  const sessionCookie = cookieStore.get("sk_session");

  if (jwtCookie?.value) {
    const payload = await verifyJWT(jwtCookie.value);
    if (payload && payload.email) return payload;
  }

  if (sessionCookie?.value) {
    try {
      const session = JSON.parse(sessionCookie.value);
      if (session && session.email) return session;
    } catch {}
  }

  return null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const guestId = searchParams.get("guestId") || "";
    const markRead = searchParams.get("markRead") === "true";

    const session = await getUserSession();
    const userEmail = session ? session.email.toLowerCase() : "";
    const targetIdentifier = userEmail || guestId.toLowerCase();

    if (!targetIdentifier) {
      return NextResponse.json({ success: true, messages: [], unreadCount: 0 });
    }

    const allMessages = getMessages();
    let updated = false;

    const threadMessages = allMessages.filter((msg: any) => {
      const recipient = (msg.recipientEmail || "").toLowerCase();
      const sender = (msg.senderEmail || "").toLowerCase();
      return recipient === targetIdentifier || sender === targetIdentifier;
    });

    if (markRead) {
      allMessages.forEach((msg: any) => {
        const recipient = (msg.recipientEmail || "").toLowerCase();
        if (msg.sender === "admin" && recipient === targetIdentifier && !msg.isRead) {
          msg.isRead = true;
          updated = true;
        }
      });

      if (updated) {
        await saveMessages(allMessages);
      }
    }

    const unreadCount = threadMessages.filter((m: any) => m.sender === "admin" && !m.isRead).length;

    return NextResponse.json({
      success: true,
      messages: threadMessages,
      unreadCount,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { guestId, messageText, name, phone } = body;

    if (!messageText || !messageText.trim()) {
      return NextResponse.json({ success: false, message: "Message content cannot be empty" }, { status: 400 });
    }

    const session = await getUserSession();
    const userEmail = session ? session.email : (guestId || "guest_" + Date.now());
    const userName = session ? session.name : (name || "Guest Client");
    const userPhone = session ? (session.phone || session.mobile || "") : (phone || "");

    const allMessages = getMessages();

    const newMessage = {
      id: "msg-widget-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      channel: "floating_widget",
      sender: "user",
      senderName: userName,
      senderEmail: userEmail,
      recipientEmail: userEmail, // recipient email set to user identifier for admin grouping
      recipientName: "SK Studio Admin",
      recipientPhone: userPhone,
      body: messageText.trim(),
      timestamp: new Date().toISOString(),
      status: "delivered",
      isRead: false,
      isGuest: !session,
    };

    allMessages.push(newMessage);
    const success = await saveMessages(allMessages);

    if (success) {
      // Broadcast SSE event to admin dashboard
      sseHub.broadcast("data_changed", { type: "message_received", data: newMessage });

      return NextResponse.json({
        success: true,
        data: newMessage,
        userEmail,
      });
    } else {
      return NextResponse.json({ success: false, message: "Failed to store message" }, { status: 500 });
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
