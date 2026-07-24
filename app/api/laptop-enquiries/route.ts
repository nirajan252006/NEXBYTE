import { NextResponse } from "next/server";
import { dbHelper } from "@/lib/dbHelper";

const JSON_HEADERS = { "Content-Type": "application/json" };

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

    console.log("API Called", "/api/laptop-enquiries", body);

    const name = body.customer_name || body.customerName || body.name;
    const phone = body.phone;

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, message: "Customer name and phone are required.", error: "Missing required fields.", code: "VALIDATION_ERROR" },
        { status: 400, headers: JSON_HEADERS }
      );
    }

    const saved = await dbHelper.laptopEnquiries.create({
      ...body,
      customer_name: name,
      phone,
    });

    return NextResponse.json(
      {
        success: true,
        id: saved.id,
        enquiry: saved,
        message: "Laptop Enquiry Submitted Successfully",
      },
      { status: 200, headers: JSON_HEADERS }
    );
  } catch (error: any) {
    console.error("Laptop Enquiry API Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to submit laptop enquiry.", error: error.message, code: "SERVER_ERROR" },
      { status: 500, headers: JSON_HEADERS }
    );
  }
}

export async function GET() {
  try {
    const list = await dbHelper.laptopEnquiries.list();
    return NextResponse.json({ success: true, enquiries: list }, { status: 200, headers: JSON_HEADERS });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch enquiries.", error: error.message, code: "SERVER_ERROR" },
      { status: 500, headers: JSON_HEADERS }
    );
  }
}
