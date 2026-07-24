import { NextResponse } from "next/server";
import { dbHelper } from "@/lib/dbHelper";

const JSON_HEADERS = { "Content-Type": "application/json" };

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Content-Type": "application/json",
    },
  });
}

export async function POST(req: Request) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON payload.", error: "Invalid JSON", code: "BAD_REQUEST" },
        { status: 400, headers: JSON_HEADERS }
      );
    }

    console.log("API Called", "/api/bookings", body);

    // 1. Validate required fields (Task 3 & 4: Customer Name, Phone, Request Type)
    const customerName = body.customerName || body.customer_name || body.name;
    const phone = body.phone;
    const requestType = body.requestType || body.request_type || "product";

    if (!customerName || !phone) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer name and phone number are required.",
          error: "Missing required fields.",
          code: "VALIDATION_ERROR",
        },
        { status: 400, headers: JSON_HEADERS }
      );
    }

    // 2. Map incoming form fields to DB fields (Task 5: Complete Booking Entity Pipeline)
    const newBooking = {
      customerName,
      phone,
      email: body.email || "",
      address: body.address || "",
      city: body.city || "Bengaluru",
      state: body.state || "Karnataka",
      pincode: body.pincode || "560001",
      bookingType: requestType,
      productName: body.selectedItem || body.productName || body.service_name || body.laptop_type || "Hardware Booking", 
      configuration: body.configuration || body.config || "Standard",
      quantity: Number(body.quantity || 1),
      preferredDate: body.preferredDate || new Date().toISOString().split("T")[0],
      preferredTime: body.preferredTime || "10:30 AM",
      remarks: body.description || body.remarks || body.message || "",
      description: body.description || body.remarks || body.message || "",
      budget: body.budget || "Standard",
      status: "submitted",
      productId: body.selectedItem || body.productId || "",
      message: body.description || body.remarks || body.message || "",
    };

    // 3. Save to database using dbHelper (Generates Booking ID, Customer ID, Notification, Activity Log, Timeline)
    const saved = await dbHelper.bookings.create(newBooking);

    return NextResponse.json(
      {
        success: true,
        bookingId: saved.bookingId,
        booking: saved,
        message: "Booking Submitted Successfully",
      },
      { status: 200, headers: JSON_HEADERS }
    );
  } catch (error: any) {
    console.error("Booking API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to submit booking.",
        error: error.message || "Internal Server Error",
        code: "SERVER_ERROR",
      },
      { status: 500, headers: JSON_HEADERS }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");
    const bookingId = searchParams.get("bookingId");

    if (phone && bookingId) {
      const match = await dbHelper.bookings.getByPhoneAndId(phone, bookingId);
      if (match) {
        return NextResponse.json({ success: true, booking: match }, { status: 200, headers: JSON_HEADERS });
      } else {
        return NextResponse.json(
          { success: false, message: "Booking not found.", error: "Booking not found.", code: "NOT_FOUND" },
          { status: 404, headers: JSON_HEADERS }
        );
      }
    }

    const allBookings = await dbHelper.bookings.list();
    return NextResponse.json({ success: true, bookings: allBookings }, { status: 200, headers: JSON_HEADERS });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Internal Error", error: error.message, code: "SERVER_ERROR" },
      { status: 500, headers: JSON_HEADERS }
    );
  }
}

export async function PUT(req: Request) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON payload.", error: "Invalid JSON", code: "BAD_REQUEST" },
        { status: 400, headers: JSON_HEADERS }
      );
    }

    const { id, chatMessage } = body;

    if (!id || !chatMessage) {
      return NextResponse.json(
        { success: false, message: "Missing required parameters (id, chatMessage).", error: "Missing parameters.", code: "VALIDATION_ERROR" },
        { status: 400, headers: JSON_HEADERS }
      );
    }

    const list = await dbHelper.bookings.list();
    const existing = list.find((b: any) => b.id === id);
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Booking not found.", error: "Booking not found.", code: "NOT_FOUND" },
        { status: 404, headers: JSON_HEADERS }
      );
    }

    const now = new Date().toISOString();
    const chatItem = {
      type: "chat",
      sender: "customer",
      message: chatMessage.trim(),
      timestamp: now
    };

    const updatedTimeline = [...(existing.timeline || []), chatItem];
    const updated = await dbHelper.bookings.update(existing.id, {
      timeline: updatedTimeline
    });

    return NextResponse.json({ success: true, booking: updated }, { status: 200, headers: JSON_HEADERS });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Internal Error", error: error.message, code: "SERVER_ERROR" },
      { status: 500, headers: JSON_HEADERS }
    );
  }
}
