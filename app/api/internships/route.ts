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

    const name = body.full_name || body.student_name || body.name;
    const phone = body.phone;
    const email = body.email;
    const college = body.college;

    if (!name || !phone || !email || !college) {
      return NextResponse.json(
        { success: false, message: "Full Name, Phone Number, Email, and College are required.", error: "Missing required fields.", code: "VALIDATION_ERROR" },
        { status: 400, headers: JSON_HEADERS }
      );
    }

    const saved = await dbHelper.internships.create({
      full_name: name,
      student_name: name,
      phone,
      email,
      city: body.city || "",
      state: body.state || "",
      college,
      university: body.university || "",
      course: body.course || "BE / B.Tech",
      branch: body.branch || "Computer Science",
      semester: body.semester || "Semester 6",
      graduation_year: body.graduation_year || "2026",
      usn: body.usn || "",
      domain: body.domain || "Full-Stack Web Dev",
      duration: body.duration || "2 Months",
      start_date: body.start_date || new Date().toISOString().split("T")[0],
      internship_type: body.internship_type || "Hybrid",
      purpose: body.purpose || "Academic Internship",
      need_project_support: Boolean(body.need_project_support),
      project_type: body.project_type || "",
      project_title: body.project_title || "",
      technology_preference: body.technology_preference || "",
      project_requirements: body.project_requirements || "",
      documents: body.documents || [],
      message: body.message || "",
      status: "pending",
    });

    return NextResponse.json(
      {
        success: true,
        id: saved.id,
        application_id: saved.application_id,
        applicationId: saved.application_id,
        status: saved.status,
        application: saved,
        message: "Internship Application Submitted Successfully",
      },
      { status: 201, headers: JSON_HEADERS }
    );
  } catch (error: any) {
    console.error("Internships POST API Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to submit internship application.", error: error.message, code: "SERVER_ERROR" },
      { status: 500, headers: JSON_HEADERS }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id") || searchParams.get("applicationId");

    const list = await dbHelper.internships.list();

    if (id) {
      const match = list.find((i: any) => i.id === id || i.application_id?.toLowerCase() === id.toLowerCase());
      if (!match) {
        return NextResponse.json(
          { success: false, message: "Application not found." },
          { status: 404, headers: JSON_HEADERS }
        );
      }
      return NextResponse.json({ success: true, application: match }, { status: 200, headers: JSON_HEADERS });
    }

    return NextResponse.json({ success: true, applications: list }, { status: 200, headers: JSON_HEADERS });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch applications.", error: error.message, code: "SERVER_ERROR" },
      { status: 500, headers: JSON_HEADERS }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Application ID is required for update." },
        { status: 400, headers: JSON_HEADERS }
      );
    }

    const updated = await dbHelper.internships.update(id, updates);

    return NextResponse.json(
      { success: true, application: updated, message: "Application updated successfully." },
      { status: 200, headers: JSON_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update application.", error: error.message, code: "SERVER_ERROR" },
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
        { success: false, message: "Application ID is required for deletion." },
        { status: 400, headers: JSON_HEADERS }
      );
    }

    await dbHelper.internships.delete(id);

    return NextResponse.json(
      { success: true, message: "Application deleted successfully." },
      { status: 200, headers: JSON_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete application.", error: error.message, code: "SERVER_ERROR" },
      { status: 500, headers: JSON_HEADERS }
    );
  }
}
