import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sanitizeText } from "@/lib/security";

type RouteParams = {
  params: Promise<{ id: string }>;
};

// PATCH /api/admin/reviews/[id] - Update review status or reply
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

  const { status, admin_reply } = body;
  const updateData: any = {};

  // If status change is requested
  if (status !== undefined) {
    if (!["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value." }, { status: 400 });
    }
    updateData.status = status;
  }

  // If admin reply is requested
  if (admin_reply !== undefined) {
    const sanitizedReply = sanitizeText(admin_reply?.trim() || "");
    updateData.admin_reply = sanitizedReply || null;
    updateData.admin_reply_at = sanitizedReply ? new Date().toISOString() : null;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No fields to update." }, { status: 400 });
  }

  // Development mock mode fallback
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ success: true, message: "Simulated patch update (No Supabase Env)." });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("reviews")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      review: data,
    });
  } catch (err: any) {
    console.error("Admin PATCH error:", err);
    return NextResponse.json({ error: err.message || "Failed to update review." }, { status: 500 });
  }
}

// DELETE /api/admin/reviews/[id] - Permanently delete a review
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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
