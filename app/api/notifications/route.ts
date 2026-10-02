import { NextResponse } from "next/server";
import { dbHelper } from "@/lib/dbHelper";

const JSON_HEADERS = { "Content-Type": "application/json" };

export async function GET() {
  try {
    const notifications = await dbHelper.notifications.list();
    return NextResponse.json(
      { success: true, notifications },
      { status: 200, headers: JSON_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Internal Error", error: error.message },
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
        { success: false, message: "Invalid JSON payload." },
        { status: 400, headers: JSON_HEADERS }
      );
    }

    const { action, id } = body;

    if (action === "markAllRead") {
      await dbHelper.notifications.markAllRead();
      return NextResponse.json({ success: true, message: "All notifications marked as read." }, { status: 200, headers: JSON_HEADERS });
    }

    if (action === "markRead" && id) {
      await dbHelper.notifications.markRead(id);
      return NextResponse.json({ success: true, message: "Notification marked as read." }, { status: 200, headers: JSON_HEADERS });
    }

    return NextResponse.json(
      { success: false, message: "Invalid action. Use 'markAllRead' or 'markRead' with id." },
      { status: 400, headers: JSON_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Internal Error" },
      { status: 500, headers: JSON_HEADERS }
    );
  }
}
