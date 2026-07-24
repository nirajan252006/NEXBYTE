import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sanitizeText } from "@/lib/security";

type RouteParams = {
  params: Promise<{ id: string }>;
};

async function verifyAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("nexbyte_admin_session")?.value;

  if (!sessionToken) return false;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!supabaseUrl && sessionToken === "mock-admin-session-token") {
    return true;
  }

  try {
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error } = await supabaseClient.auth.getUser(sessionToken);

    if (error || !user || !user.email) return false;

    const allowedEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase());

    return allowedEmails.includes(user.email.toLowerCase());
  } catch (e) {
    return false;
  }
}

// PATCH /api/admin/reviews/[id] - Update review status or reply
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const isAuthorized = await verifyAdminSession();
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Review ID is required." }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { status, admin_reply, featured, rejection_reason, modification_reason } = body;
  const updateData: any = {};

  // If status change is requested
  if (status !== undefined) {
    if (!["pending", "approved", "rejected", "need_modification"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value." }, { status: 400 });
    }
    updateData.status = status;
  }

  if (rejection_reason !== undefined) {
    updateData.rejection_reason = sanitizeText(rejection_reason?.trim() || "");
  }

  if (modification_reason !== undefined) {
    updateData.modification_reason = sanitizeText(modification_reason?.trim() || "");
  }

  // If admin reply is requested
  if (admin_reply !== undefined) {
    const sanitizedReply = sanitizeText(admin_reply?.trim() || "");
    updateData.admin_reply = sanitizedReply || null;
    updateData.admin_reply_at = sanitizedReply ? new Date().toISOString() : null;
  }

  // If featured is requested
  if (featured !== undefined) {
    updateData.featured = !!featured;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No fields to update." }, { status: 400 });
  }

  try {
    const { dbHelper } = await import("@/lib/dbHelper");
    const updatedReview = await dbHelper.reviews.update(id, updateData);

    return NextResponse.json({
      success: true,
      review: updatedReview,
    });
  } catch (err: any) {
    console.error("Admin PATCH error:", err);
    return NextResponse.json({ error: err.message || "Failed to update review." }, { status: 500 });
  }
}

// DELETE /api/admin/reviews/[id] - Permanently delete a review
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const isAuthorized = await verifyAdminSession();
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Review ID is required." }, { status: 400 });
  }

  // Development mock mode fallback
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ success: true, message: "Simulated review delete (No Supabase Env)." });
  }

  try {
    const { error } = await supabaseAdmin
      .from("reviews")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Review permanently deleted.",
    });
  } catch (err: any) {
    console.error("Admin DELETE error:", err);
    return NextResponse.json({ error: err.message || "Failed to delete review." }, { status: 500 });
  }
}
