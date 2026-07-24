import { NextResponse } from "next/server";
import { dbHelper } from "@/lib/dbHelper";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("API Called", "/api/contacts", body);

    if (!body.name || !body.email || !body.message) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const saved = await dbHelper.contacts.create(body);

    return NextResponse.json({
      success: true,
      id: saved.id,
      contact: saved,
      message: "Message Sent Successfully",
    });
  } catch (error: any) {
    console.error("Contacts API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send message." },
      { status: 500 }
    );
  }
}
