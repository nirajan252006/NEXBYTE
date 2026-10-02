import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const {
    businessName, ownerName, email, phone, address, city, state,
    businessType, gstin, description, password
  } = body;

  if (!businessName || !ownerName || !email || !phone || !city || !password) {
    return NextResponse.json(
      { error: "Business name, owner name, email, phone, city, and password are required." },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    const { dbHelper } = await import("@/lib/dbHelper");

    // Check duplicate email
    const existing = await dbHelper.resellers.getByEmail(cleanEmail);
    if (existing) {
      return NextResponse.json(
        { error: "A reseller account with this email already exists." },
        { status: 409 }
      );
    }

    // 1. Supabase Auth Registration (if configured)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    let authUserId = null;
    if (supabaseUrl) {
      const { createClient } = await import("@supabase/supabase-js");
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: ownerName,
            business_name: businessName,
            role: "reseller",
            status: "pending",
          },
        },
      });

      if (authError && !authError.message.includes("User already registered")) {
        console.warn("Supabase Auth registration warning:", authError.message);
      }
      if (authData?.user) {
        authUserId = authData.user.id;
      }
    }

    // 2. Create authoritative Reseller record (no plaintext password)
    const newReseller = await dbHelper.resellers.create({
      auth_user_id: authUserId,
      business_name: businessName,
      owner_name: ownerName,
      email: cleanEmail,
      phone,
      address: address || "",
      city,
      state: state || "",
      business_type: businessType || "individual",
      gstin: gstin || "",
      description: description || "",
      status: "pending", // Admin must approve
      role: "reseller",
    });

    // 3. Create Admin notification
    await dbHelper.notifications.create({
      title: "🏪 New Reseller Application",
      message: `${businessName} (${ownerName}) applied for a reseller account. City: ${city}`,
      type: "reseller_application",
      status: "unread",
      meta: { reseller_id: newReseller.id, email: cleanEmail },
    });

    return NextResponse.json({
      success: true,
      message: "Registration submitted! Admin will review and approve your account. You'll be notified once activated.",
      resellerId: newReseller.id,
    });
  } catch (err: any) {
    console.error("Reseller register error:", err);
    return NextResponse.json({ error: err.message || "Internal server error." }, { status: 500 });
  }
}

