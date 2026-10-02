import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AuthGateway from "@/components/AuthGateway";

export const metadata: Metadata = {
  title: "NexByte Technologies | Premium Technology Entrance Gateway",
};

export default async function HomePage() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("nexbyte_admin_session")?.value;
  const resellerSession = cookieStore.get("nexbyte_reseller_session")?.value;
  const userSession = cookieStore.get("nexbyte_customer_session")?.value;

  // Root URL / MUST ALWAYS render the NexByte Technologies entrance gateway page.
  // Never automatically redirect to /admin, /reseller, or /login.
  return (
    <AuthGateway
      hasAdminSession={Boolean(adminSession)}
      hasResellerSession={Boolean(resellerSession)}
      hasUserSession={Boolean(userSession)}
    />
  );
}
