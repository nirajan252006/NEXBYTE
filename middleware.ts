import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect authenticated admins away from login page to dashboard
  if (pathname === "/admin/login") {
    const sessionCookie = request.cookies.get("nexbyte_admin_session")?.value;
    if (sessionCookie) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  // Protect all /admin routes except /admin/login
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const sessionCookie = request.cookies.get("nexbyte_admin_session")?.value;

    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    // Development fallback if Supabase is not configured yet
    if (!supabaseUrl && sessionCookie === "mock-admin-session-token") {
      return NextResponse.next();
    }

    try {
      const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
      const { data: { user }, error } = await supabaseClient.auth.getUser(sessionCookie);

      if (error || !user || !user.email) {
        // Clear invalid session cookie
        const res = NextResponse.redirect(new URL("/admin/login", request.url));
        res.cookies.delete("nexbyte_admin_session");
        return res;
      }

      // Check email against allowlist
      const allowedEmails = (process.env.ADMIN_EMAILS || "admin@nexbyte.com")
        .split(",")
        .map((email) => email.trim().toLowerCase());

      if (!allowedEmails.includes(user.email.toLowerCase())) {
        const res = NextResponse.redirect(new URL("/admin/login", request.url));
        res.cookies.delete("nexbyte_admin_session");
        return res;
      }
    } catch (e) {
      const res = NextResponse.redirect(new URL("/admin/login", request.url));
      res.cookies.delete("nexbyte_admin_session");
      return res;
    }
  }

  // Protect all /customer routes except /customer/login
  if (pathname.startsWith("/customer") && pathname !== "/customer/login") {
    const sessionCookie = request.cookies.get("nexbyte_customer_session")?.value;

    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/customer/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/customer/:path*"],
};
