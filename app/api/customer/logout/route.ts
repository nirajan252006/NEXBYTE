import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  response.cookies.delete("nexbyte_customer_session");
  response.cookies.delete("nexbyte_customer_email");
  response.cookies.delete("nexbyte_customer_name");
  
  return response;
}
