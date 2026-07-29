import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { atomicDb } from "@/app/lib/db";
import { sseHub } from "@/app/lib/sse";

export const dynamic = "force-dynamic";

function getBookings() {
  return atomicDb.readJson("bookings.json", []);
}

function getEnquiries() {
  return atomicDb.readJson("enquiries.json", []);
}

export async function GET(request: Request) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("sk_session");

    if (!sessionCookie?.value) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    let session;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid session" },
        { status: 401 }
      );
    }

    const userId = session.userId;
    const userEmail = session.email;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Invalid session" },
        { status: 401 }
      );
    }

    // Get all bookings
    const bookings = getBookings();

    // Filter bookings by user_id or email
    const userBookings = bookings.filter(
      (booking: any) => booking.user_id === userId || (userEmail && booking.email === userEmail)
    );

    // Get frame enquiries
    const enquiries = getEnquiries();
    const userEnquiries = enquiries
      .filter((enq: any) => userEmail && enq.customerEmail && enq.customerEmail.toLowerCase() === userEmail.toLowerCase())
      .map((enq: any) => ({
        id: enq.id,
        name: enq.customerName,
        email: enq.customerEmail,
        phone: enq.customerPhone,
        service: enq.frameCode ? `Photo Frame: ${enq.frameCode} (${enq.frameName})` : "Photo Frame Order",
        date: enq.createdAt ? new Date(enq.createdAt).toISOString().split("T")[0] : "N/A",
        status: enq.status || "New",
        createdAt: enq.createdAt || new Date().toISOString()
      }));

    // Merge and sort by createdAt descending
    const combined = [...userBookings, ...userEnquiries];
    combined.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({
      success: true,
      bookings: combined,
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("sk_session");

    if (!sessionCookie?.value) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    let session;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid session" },
        { status: 401 }
      );
    }

    const userId = session.userId;
    const userEmail = session.email;

    if (!userId || !userEmail) {
      return NextResponse.json(
        { success: false, message: "Invalid session" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, phone, service, date, message } = body;

    // Validate required fields
    if (!name || !phone || !service || !date) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create booking
    const bookings = getBookings();
    const booking = {
      id: "bk-" + Date.now(),
      user_id: userId,
      name: name.trim(),
      email: userEmail,
      phone: phone.trim(),
      service,
      date,
      message: message || "",
      createdAt: new Date().toISOString(),
      status: "pending",
    };

    bookings.push(booking);

    // Save bookings
    await atomicDb.writeJson("bookings.json", bookings);

    // Broadcast SSE to update admin dashboard in real-time
    sseHub.broadcast("data_changed", { type: "booking_created", data: booking });

    return NextResponse.json({
      success: true,
      booking,
      message: "Booking created successfully",
    });
  } catch (error: unknown) {
    console.error("Booking API Error:", error);
    const message = error instanceof Error ? error.message : "Failed to process booking.";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
