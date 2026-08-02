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

// Generate smart instant response for client inquiries
function generateAutoReply(userMsg: string): string {
  const query = userMsg.toLowerCase();

  if (query.includes("hi") || query.includes("hello") || query.includes("hey") || query.includes("hii")) {
    return "Hello! 👋 Welcome to SK Photo Studio Pune. How can we help you today? Ask us about maternity shoots, baby photography, wedding packages, or studio pricing!";
  } else if (query.includes("price") || query.includes("cost") || query.includes("charge") || query.includes("rate") || query.includes("package")) {
    return "📸 SK Photo Studio Pune offers custom packages for Maternity, Baby, Pre-wedding & Wedding shoots. For custom package details & discounts, please leave your mobile number or chat directly on WhatsApp at +91 93071 12119!";
  } else if (query.includes("maternity") || query.includes("pregnant") || query.includes("pregnancy")) {
    return "🤰 Our Maternity Sessions include luxury gown closet access, indoor aesthetic lighting setups, and outdoor garden photography. Would you like to schedule a consultation?";
  } else if (query.includes("baby") || query.includes("newborn") || query.includes("kids")) {
    return "👶 We specialize in baby & newborn shoots with certified baby-safe props, themes, and comfortable studio environments. Tell us the age of your baby to share setup ideas!";
  } else if (query.includes("wedding") || query.includes("pre-wedding") || query.includes("haldi")) {
    return "💍 Congratulations! Our Wedding Segment covers pre-wedding, haldi, marriage ceremony & cinematic teasers. Contact us at +91 93071 12119 for date availability!";
  } else if (query.includes("address") || query.includes("location") || query.includes("where")) {
    return "📍 Studio Address: Sakubai Gawali Gardan, Shriram Colony, Bhosari, Maharashtra 411039. We are open Monday to Sunday!";
  }

  return `Thank you for reaching out to SK Photo Studio Pune! We have logged your request. Our team will respond shortly. For urgent inquiries, WhatsApp us at +91 93071 12119.`;
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
    const guestContact = (name || phone) ? `${name || "Guest"} (Ph: ${phone || "N/A"})` : "Guest Client";
    const userEmail = session ? session.email : (guestId || "guest_" + Date.now());
    const userName = session ? session.name : guestContact;
    const userPhone = session ? (session.phone || session.mobile || "") : (phone || "");

    const allMessages = getMessages();

    // 1. Save user's incoming message
    const userMsg = {
      id: "msg-widget-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      channel: "floating_widget",
      sender: "user",
      senderName: userName,
      senderEmail: userEmail,
      recipientEmail: userEmail,
      recipientName: "SK Studio Admin",
      recipientPhone: userPhone,
      body: messageText.trim(),
      timestamp: new Date().toISOString(),
      status: "delivered",
      isRead: false,
      isGuest: !session,
    };

    allMessages.push(userMsg);

    // 2. Generate instant Automated Studio Reply
    const autoReplyText = generateAutoReply(messageText.trim());
    const botMsg = {
      id: "msg-bot-" + (Date.now() + 1) + "-" + Math.random().toString(36).substring(2, 6),
      channel: "floating_widget",
      sender: "admin",
      senderName: "SK Studio Assistant",
      senderEmail: userEmail,
      recipientEmail: userEmail,
      recipientName: userName,
      body: autoReplyText,
      timestamp: new Date(Date.now() + 500).toISOString(),
      status: "delivered",
      isRead: false,
      isGuest: !session,
    };

    allMessages.push(botMsg);

    const success = await saveMessages(allMessages);

    if (success) {
      // 3. Update lastActiveAt if registered user
      if (session?.email) {
        try {
          const users = atomicDb.readJson("users.json", {});
          const uEntry = Object.values(users).find((u: any) => u?.email?.toLowerCase() === session.email.toLowerCase()) as any;
          if (uEntry) {
            uEntry.lastActiveAt = new Date().toISOString();
            await atomicDb.writeJson("users.json", users);
          }
        } catch {}
      }

      // 4. Broadcast SSE events to admin dashboard and clients for instant real-time sync
      sseHub.broadcast("message_received", userMsg);
      sseHub.broadcast("data_changed", { type: "message_received", data: userMsg });

      return NextResponse.json({
        success: true,
        data: userMsg,
        reply: botMsg,
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
