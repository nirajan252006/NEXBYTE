import { NextRequest, NextResponse } from "next/server";
import { dbHelper } from "@/lib/dbHelper";

export async function GET(request: NextRequest) {
  try {
    const adminSession = request.cookies.get("nexbyte_admin_session")?.value;
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized: Admin session required." }, { status: 401 });
    }

    const list = await dbHelper.resellers.list();
    return NextResponse.json({ success: true, resellers: list });
  } catch (err: any) {
    console.error("GET Admin Resellers error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const adminSession = request.cookies.get("nexbyte_admin_session")?.value;
    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized: Admin session required." }, { status: 401 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Reseller ID and status are required." }, { status: 400 });
    }

    const updated = await dbHelper.resellers.update(id, { status });

    await dbHelper.notifications.create({
      title: `Reseller Application ${status.toUpperCase()}`,
      message: `Reseller account (${updated?.business_name || updated?.owner_name || id}) status set to ${status}`,
      type: "reseller_status",
      status: "unread",
    });

    return NextResponse.json({ success: true, reseller: updated });
  } catch (err: any) {
    console.error("PATCH Admin Resellers error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
