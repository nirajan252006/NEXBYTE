"use client";

import dynamic from "next/dynamic";

const BookServiceReviewModal = dynamic(() => import("@/components/BookServiceReviewModal"), { ssr: false });
const AdminFloatingButton = dynamic(() => import("@/components/AdminFloatingButton"), { ssr: false });
const UnifiedBookingModal = dynamic(() => import("@/components/UnifiedBookingModal"), { ssr: false });
const EnrollmentModal = dynamic(() => import("@/components/EnrollmentModal"), { ssr: false });

export default function ClientModals() {
  return (
    <>
      <BookServiceReviewModal />
      <AdminFloatingButton />
      <UnifiedBookingModal />
      <EnrollmentModal />
    </>
  );
}
