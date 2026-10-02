"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import CustomerSidebar from "@/components/CustomerSidebar";
import CustomerHeader from "@/components/CustomerHeader";
import NotificationProvider from "@/components/NotificationProvider";
import CartDrawer from "@/components/CartDrawer";
import AiChatWidget from "@/components/AiChatWidget";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Check if current route is an unauthenticated Auth route (signin, signup, forgot-password)
  const isAuthRoute =
    pathname.endsWith("/signin") ||
    pathname.endsWith("/signup") ||
    pathname.endsWith("/forgot-password");

  if (isAuthRoute) {
    return (
      <NotificationProvider>
        <div className="min-h-screen bg-[#F6F8FC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center">
          {children}
        </div>
      </NotificationProvider>
    );
  }

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-[#F6F8FC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
        {/* Desktop Sidebar & Mobile Drawer */}
        <CustomerSidebar
          mobileOpen={mobileSidebarOpen}
          setMobileOpen={setMobileSidebarOpen}
        />

        {/* Main Content Column */}
        <div className="flex-1 flex flex-col lg:pl-64 transition-all duration-300">
          {/* Top Utility Header */}
          <CustomerHeader onOpenMobileMenu={() => setMobileSidebarOpen(true)} />

          {/* Page Content Container */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            {children}
          </main>
        </div>

        {/* Global Components */}
        <CartDrawer />
        <AiChatWidget portal="customer" />
      </div>
    </NotificationProvider>
  );
}
