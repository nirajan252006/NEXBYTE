"use client";

import { Suspense } from "react";
import CustomerAccountPortal from "../account/page";

export default function CustomerOrdersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-nex-black flex items-center justify-center text-white">Loading orders...</div>}>
      <CustomerAccountPortal />
    </Suspense>
  );
}
