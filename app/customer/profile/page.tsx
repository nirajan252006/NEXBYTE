"use client";

import { Suspense } from "react";
import CustomerAccountPortal from "../account/page";

export default function CustomerProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-nex-black flex items-center justify-center text-white">Loading profile...</div>}>
      <CustomerAccountPortal />
    </Suspense>
  );
}
