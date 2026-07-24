import { NextResponse } from "next/server";
import { dbHelper } from "@/lib/dbHelper";

const JSON_HEADERS = { "Content-Type": "application/json" };

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Content-Type": "application/json",
    },
  });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const searchVal = searchParams.get("search");

    if (!searchVal) {
      return NextResponse.json(
        { success: false, message: "Search parameter is required.", error: "Missing search parameter.", code: "VALIDATION_ERROR" },
        { status: 400, headers: JSON_HEADERS }
      );
    }

    const cleanSearch = searchVal.trim().toLowerCase();

    // 1. Fetch lists
    const bookings = await dbHelper.bookings.list();
    const enrollments = await dbHelper.enrollments.list();

    // 2. Filter matches
    const matchedBookings = bookings.filter(
      (b: any) =>
        b.bookingId?.toLowerCase() === cleanSearch ||
        b.id?.toLowerCase() === cleanSearch ||
        (b.phone || "").replace(/\D/g, "").includes(cleanSearch.replace(/\D/g, ""))
    );

    const matchedEnrollments = enrollments.filter(
      (e: any) =>
        e.enrollmentId?.toLowerCase() === cleanSearch ||
        e.id?.toLowerCase() === cleanSearch ||
        (e.phone || "").replace(/\D/g, "").includes(cleanSearch.replace(/\D/g, ""))
    );

    return NextResponse.json(
      {
        success: true,
        results: {
          bookings: matchedBookings,
          enrollments: matchedEnrollments,
        },
      },
      { status: 200, headers: JSON_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to search track requests.", error: error.message, code: "SERVER_ERROR" },
      { status: 500, headers: JSON_HEADERS }
    );
  }
}
