"use client";

import { Suspense } from "react";
import CustomerAccountPortal from "../account/page";

export default function CustomerBookingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-nex-black flex items-center justify-center text-white">Loading bookings...</div>}>
      <CustomerAccountPortal />
    </Suspense>
  );
}
