"use client";

import { Suspense } from "react";
import CustomerAccountPortal from "../account/page";

export default function CustomerMessagesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-nex-black flex items-center justify-center text-white">Loading messages...</div>}>
      <CustomerAccountPortal />
    </Suspense>
  );
}
