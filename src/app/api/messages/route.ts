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
    const session = await getUserSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const shouldMarkRead = searchParams.get("markRead") === "true";

    const userEmail = session.email.toLowerCase();
    const allMessages = getMessages();

    let updated = false;
    const userMessages = allMessages.filter((msg: any) => {
      const isRecipient = msg.recipientEmail && msg.recipientEmail.toLowerCase() === userEmail;
      const isSender = msg.senderEmail && msg.senderEmail.toLowerCase() === userEmail;
      return isRecipient || isSender;
    });

    if (shouldMarkRead) {
      allMessages.forEach((msg: any) => {
        if (
          msg.recipientEmail &&
          msg.recipientEmail.toLowerCase() === userEmail &&
          msg.sender === "admin" &&
          !msg.isRead
        ) {
          msg.isRead = true;
          updated = true;
        }
      });

      if (updated) {
        await saveMessages(allMessages);
      }
    }

    // Calculate unread count (admin messages sent to this user that are not read)
    const unreadCount = userMessages.filter(
      (m: any) => m.sender === "admin" && !m.isRead
    ).length;

    return NextResponse.json({
      success: true,
      messages: userMessages,
      unreadCount,
    });
  } catch (error: any) {
    console.error("GET user messages error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getUserSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { messageText } = body;

    if (!messageText || !messageText.trim()) {
      return NextResponse.json({ success: false, message: "Message content cannot be empty" }, { status: 400 });
    }

    const allMessages = getMessages();

    const newMessage = {
      id: "msg-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      channel: "web_chat",
      sender: "user",
      senderName: session.name || "Client",
      senderEmail: session.email,
      recipientEmail: session.email, // set recipient to user email so admin filtering groups it under client email
      recipientName: "SK Studio Admin",
      recipientPhone: session.phone || session.mobile || "",
      body: messageText.trim(),
      timestamp: new Date().toISOString(),
      status: "delivered",
      isRead: false,
    };

    allMessages.push(newMessage);
    const success = await saveMessages(allMessages);

    if (success) {
      // Broadcast SSE so admin panel updates live and pops up a alert
      sseHub.broadcast("data_changed", {
        type: "message_received",
        data: newMessage,
      });

      return NextResponse.json({
        success: true,
        message: "Message sent successfully",
        data: newMessage,
      });
    } else {
      return NextResponse.json({ success: false, message: "Failed to store message" }, { status: 500 });
    }
  } catch (error: any) {
    console.error("POST user message error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
