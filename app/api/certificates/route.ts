import { NextResponse } from "next/server";
import { dbHelper } from "@/lib/dbHelper";

export async function GET(req: Request) {
  try {
    const list = await dbHelper.certificates.list();
    return NextResponse.json(list);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch certificates." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate fields
    if (!body.registrationId || !body.certificateId || !body.studentName || !body.courseTitle) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const saved = await dbHelper.certificates.create(body);

    return NextResponse.json({
      success: true,
      certificate: saved,
      message: "Certificate issued successfully",
    });
  } catch (error: any) {
    console.error("Certificate API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create certificate." },
      { status: 500 }
    );
  }
}
