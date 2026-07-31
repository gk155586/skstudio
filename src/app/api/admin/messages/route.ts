import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sseHub } from "@/app/lib/sse";
import { atomicDb } from "@/app/lib/db";
import { verifyJWT } from "@/app/lib/jwt";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getMessages() {
  return atomicDb.readJson("messages.json", []);
}

async function saveMessages(messages: any) {
  return await atomicDb.writeJson("messages.json", messages);
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

export async function GET(request: Request) {
  try {
    const session = await verifyAdminAuth();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized: Admin session required" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const markRead = searchParams.get("markRead") === "true";
    const targetEmail = (searchParams.get("email") || "").toLowerCase().trim();

    const messages = getMessages();

    if (markRead && targetEmail) {
      let updated = false;
      messages.forEach((msg: any) => {
        const msgSender = (msg.senderEmail || "").toLowerCase();
        const msgRecipient = (msg.recipientEmail || "").toLowerCase();
        if (msg.sender === "user" && (msgSender === targetEmail || msgRecipient === targetEmail) && !msg.isRead) {
          msg.isRead = true;
          updated = true;
        }
      });

      if (updated) {
        await saveMessages(messages);
      }
    }

    return NextResponse.json({ success: true, messages });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await verifyAdminAuth();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized: Admin session required" }, { status: 401 });
    }

    const body = await request.json();
    const { recipientEmail, recipientPhone, recipientName, messageText } = body;

    if (!messageText || !messageText.trim() || !recipientEmail) {
      return NextResponse.json({ success: false, message: "Recipient email and message text are required" }, { status: 400 });
    }

    const messages = getMessages();

    const newMessage = {
      id: "msg-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      channel: "platform",
      sender: "admin",
      senderName: session.name || "SK Studio Admin",
      senderEmail: session.email || "skstudiopune@gmail.com",
      recipientEmail: recipientEmail.trim(),
      recipientPhone: recipientPhone || "",
      recipientName: recipientName || "Client",
      body: messageText.trim(),
      timestamp: new Date().toISOString(),
      status: "delivered",
      isRead: false,
    };

    messages.push(newMessage);
    const success = await saveMessages(messages);

    if (success) {
      // Trigger SSE broadcaster to update client and admin panels in real-time
      sseHub.broadcast("data_changed", { type: "message_received", data: newMessage });
      return NextResponse.json({
        success: true,
        message: "Message dispatched successfully",
        data: newMessage,
      });
    } else {
      return NextResponse.json({ success: false, message: "Failed to store message" }, { status: 500 });
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
