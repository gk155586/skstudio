import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { atomicDb } from "@/app/lib/db";
import { sseHub } from "@/app/lib/sse";

export const dynamic = "force-dynamic";

const ENQUIRIES_FILE = path.join(process.cwd(), "data", "enquiries.json");

// Helper to load enquiries
function loadEnquiries() {
  if (fs.existsSync(ENQUIRIES_FILE)) {
    try {
      const content = fs.readFileSync(ENQUIRIES_FILE, "utf8");
      return JSON.parse(content || "[]");
    } catch (err) {
      console.error("Error reading enquiries file:", err);
    }
  }
  return [];
}

export async function GET() {
  try {
    const enquiries = loadEnquiries();
    // Sort newest enquiries first
    enquiries.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return NextResponse.json({ success: true, enquiries });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Failed to load enquiries" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const customerName = body.customerName || body.name || "Guest Visitor";
    const customerPhone = body.customerPhone || body.phone || "N/A";
    const customerEmail = body.customerEmail || body.email || `${customerPhone.replace(/\D/g, "") || Date.now()}@inquiry.skstudio.store`;
    const frameId = body.frameId || "contact_inquiry";
    const frameCode = body.frameCode || body.eventType || "General Enquiry";
    const frameName = body.frameName || body.eventType || "Photoshoot Inquiry";
    const details = body.details || body.message || `Event Date: ${body.eventDate || "N/A"}`;

    if (!customerName || !customerPhone) {
      return NextResponse.json({ success: false, message: "Customer name and phone number are required" }, { status: 400 });
    }

    const enquiries = loadEnquiries();

    const newEnquiry = {
      id: "enq-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      frameId,
      frameCode,
      frameName,
      customerName,
      customerEmail,
      customerPhone,
      details,
      createdAt: new Date().toISOString(),
      status: "New"
    };

    enquiries.push(newEnquiry);
    await atomicDb.writeJson("enquiries.json", enquiries);

    // Broadcast SSE update event (tells the admin dashboard to refresh enquiries list)
    sseHub.broadcast("data_changed", { type: "enquiry_received", data: newEnquiry });

    return NextResponse.json({ success: true, message: "Enquiry submitted successfully", enquiry: newEnquiry });

  } catch (error: any) {
    console.error("POST enquiries error:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
