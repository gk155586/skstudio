import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { atomicDb } from "@/app/lib/db";
import { sseHub } from "@/app/lib/sse";

export const dynamic = "force-dynamic";

const ENQUIRIES_FILE = path.join(process.cwd(), "data", "enquiries.json");

// Helper to load enquiries
function loadEnquiries(): any[] {
  const enquiries: any[] = atomicDb.readJson("enquiries.json", []);
  const bookings: any[] = atomicDb.readJson("bookings.json", []);

  const existingBookingIds = new Set(
    enquiries.map((e: any) => e.bookingId || e.id).filter(Boolean)
  );

  bookings.forEach((b: any) => {
    if (b && b.id && !existingBookingIds.has(b.id)) {
      enquiries.push({
        id: `enq-${b.id}`,
        bookingId: b.id,
        name: b.name || "Client",
        customerName: b.name || "Client",
        email: b.email || "",
        customerEmail: b.email || "",
        phone: b.phone || "",
        customerPhone: b.phone || "",
        service: b.service || "Photoshoot Session",
        frameName: b.service || "Photoshoot Session",
        budget: b.price || 0,
        price: b.price || 0,
        date: b.date || "",
        eventDate: b.date || "",
        message: b.message || "",
        details: b.message || `Session booked for ${b.date || "scheduled date"}`,
        status: b.status === "confirmed" || b.status === "completed" ? "Converted" : (b.status === "cancelled" ? "Lost" : "New"),
        source: "Book a Session",
        createdAt: b.createdAt || new Date().toISOString()
      });
    }
  });

  return enquiries;
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
    const customerName = (body.customerName || body.name || "Guest Visitor").trim();
    const customerPhone = (body.customerPhone || body.phone || "N/A").trim();
    const customerEmail = (body.customerEmail || body.email || `${customerPhone.replace(/\D/g, "") || Date.now()}@inquiry.skstudio.store`).trim();
    const frameId = body.frameId || "contact_inquiry";
    const serviceName = body.service || body.eventType || body.frameName || body.frameCode || "General Enquiry";
    const frameCode = body.frameCode || body.eventType || serviceName;
    const frameName = body.frameName || serviceName;
    const dateVal = body.eventDate || body.date || "";
    const messageVal = body.message || body.details || "";
    const details = messageVal || (dateVal ? `Preferred Date: ${dateVal}` : "Inquiry submitted");
    const budgetVal = Number(body.budget || body.price) || 0;

    if (!customerName || !customerPhone) {
      return NextResponse.json({ success: false, message: "Customer name and phone number are required" }, { status: 400 });
    }

    const enquiries = loadEnquiries();

    const newEnquiry = {
      id: "enq-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      name: customerName,
      customerName,
      email: customerEmail,
      customerEmail,
      phone: customerPhone,
      customerPhone,
      service: serviceName,
      frameName,
      frameCode,
      frameId,
      budget: budgetVal,
      price: budgetVal,
      date: dateVal,
      eventDate: dateVal,
      message: messageVal,
      details,
      source: frameId === "contact_inquiry" ? "Contact Page" : (body.frameId ? "Photo Frames" : "Direct Enquiry"),
      status: "New",
      createdAt: new Date().toISOString()
    };

    enquiries.unshift(newEnquiry);
    await atomicDb.writeJson("enquiries.json", enquiries);

    // Broadcast SSE update events (instant notification for admin dashboard)
    sseHub.broadcast("data_changed", { type: "enquiry_received", data: newEnquiry });
    sseHub.broadcast("enquiry_received", newEnquiry);

    return NextResponse.json({ success: true, message: "Enquiry submitted successfully", enquiry: newEnquiry });

  } catch (error: any) {
    console.error("POST enquiries error:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
