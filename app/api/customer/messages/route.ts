import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbHelper } from "@/lib/dbHelper";

function getAuthUser(cookieStore: any) {
  const userSession = cookieStore.get("nexbyte_customer_session")?.value;
  if (!userSession) return null;
  const parts = userSession.split(":");
  return { id: parts[1] || parts[0], email: parts[2] || parts[0] };
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const authUser = getAuthUser(cookieStore);

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const messages = await dbHelper.messages.getByUser(authUser.id);
    return NextResponse.json({ messages });
  } catch (err: any) {
    console.error("GET Customer Messages Error:", err);
    return NextResponse.json({ error: "Failed to fetch messages." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const authUser = getAuthUser(cookieStore);

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const { subject, message, recipient } = await request.json();
    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message content is required." }, { status: 400 });
    }

    const newMessage = await dbHelper.messages.send({
      user_id: authUser.id,
      customer_email: authUser.email,
      subject: subject || "Customer Enquiry",
      message: message.trim(),
      sender: "customer",
      recipient: recipient || "seller",
    });

    return NextResponse.json({ success: true, message: newMessage });
  } catch (err: any) {
    console.error("POST Customer Message Error:", err);
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }
}
