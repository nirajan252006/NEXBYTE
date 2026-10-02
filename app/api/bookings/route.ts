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

    console.log("[BOOKING API RECEIVED]", "/api/bookings POST", body);

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
      status: "new",
      productId: body.selectedItem || body.productId || "",
      message: body.description || body.remarks || body.message || "",
    };

    // 3. Save to database using dbHelper (Generates Booking ID, Customer ID, Notification, Activity Log, Timeline)
    console.log("[BOOKING DB INSERT]", newBooking);
    const saved = await dbHelper.bookings.create(newBooking);
    console.log("[BOOKING DB INSERT SUCCESS]", saved.bookingId);

    return NextResponse.json(
      {
        success: true,
        bookingId: saved.bookingId,
        booking: saved,
        message: "Booking Submitted Successfully",
      },
      { status: 201, headers: JSON_HEADERS }
    );
  } catch (error: any) {
    console.error("[BOOKING DB ERROR]", error);
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
    const id = searchParams.get("id");

    // Single booking lookup by internal id
    if (id) {
      const list = await dbHelper.bookings.list();
      const match = list.find((b: any) => b.id === id || b.bookingId === id);
      if (match) {
        return NextResponse.json({ success: true, booking: match }, { status: 200, headers: JSON_HEADERS });
      }
      return NextResponse.json(
        { success: false, message: "Booking not found.", error: "Booking not found.", code: "NOT_FOUND" },
        { status: 404, headers: JSON_HEADERS }
      );
    }

    // Customer tracking lookup by phone + bookingId
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

    // List all bookings (admin fetch)
    console.log("[ADMIN BOOKINGS FETCH]");
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

    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing required parameter: id.", error: "Missing id.", code: "VALIDATION_ERROR" },
        { status: 400, headers: JSON_HEADERS }
      );
    }

    // If chatMessage is present, this is a customer chat message
    if (body.chatMessage) {
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
        sender: body.sender || "customer",
        message: body.chatMessage.trim(),
        timestamp: now
      };

      const updatedTimeline = [...(existing.timeline || []), chatItem];
      const updated = await dbHelper.bookings.update(existing.id, {
        timeline: updatedTimeline,
        ...(body.replyMessage ? { replyMessage: body.replyMessage } : {}),
        ...(body.replyDate ? { replyDate: body.replyDate } : {}),
        ...(body.replyBy ? { replyBy: body.replyBy } : {}),
        ...(body.status ? { status: body.status } : {}),
      });

      return NextResponse.json({ success: true, booking: updated }, { status: 200, headers: JSON_HEADERS });
    }

    // Otherwise, this is a general admin update (status, technician, notes, etc.)
    const updates: any = {};
    if (body.status !== undefined) updates.status = body.status;
    if (body.assignedTo !== undefined) { updates.assignedTo = body.assignedTo; updates.technician = body.assignedTo; }
    if (body.technician !== undefined) { updates.technician = body.technician; updates.assignedTo = body.technician; }
    if (body.notes !== undefined) updates.notes = body.notes;
    if (body.booking_date !== undefined) updates.booking_date = body.booking_date;
    if (body.booking_time !== undefined) updates.booking_time = body.booking_time;
    if (body.replyMessage !== undefined) updates.replyMessage = body.replyMessage;
    if (body.replyDate !== undefined) updates.replyDate = body.replyDate;
    if (body.replyBy !== undefined) updates.replyBy = body.replyBy;
    if (body.timeline !== undefined) updates.timeline = body.timeline;
    if (body.updatedBy !== undefined) updates.updatedBy = body.updatedBy;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, message: "No update fields provided.", error: "No updates.", code: "VALIDATION_ERROR" },
        { status: 400, headers: JSON_HEADERS }
      );
    }

    const updated = await dbHelper.bookings.update(id, updates);

    return NextResponse.json({ success: true, booking: updated }, { status: 200, headers: JSON_HEADERS });
  } catch (error: any) {
    console.error("[BOOKING UPDATE ERROR]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Error", error: error.message, code: "SERVER_ERROR" },
      { status: 500, headers: JSON_HEADERS }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing required parameter: id.", error: "Missing id.", code: "VALIDATION_ERROR" },
        { status: 400, headers: JSON_HEADERS }
      );
    }

    await dbHelper.bookings.delete(id);

    return NextResponse.json({ success: true, message: "Booking deleted successfully." }, { status: 200, headers: JSON_HEADERS });
  } catch (error: any) {
    console.error("[BOOKING DELETE ERROR]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Error", error: error.message, code: "SERVER_ERROR" },
      { status: 500, headers: JSON_HEADERS }
    );
  }
}
