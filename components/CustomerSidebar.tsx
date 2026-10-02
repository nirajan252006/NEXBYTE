"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  ShoppingBag,
  Wrench,
  Package,
  Boxes,
  Tag,
  Heart,
  MessageSquare,
  Bell,
  HelpCircle,
  Bot,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface CustomerSidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  onOpenAiChat?: () => void;
}

const MAIN_NAV = [
  { href: "/customer", label: "Home", icon: Home },
  { href: "/customer/shop", label: "Shop", icon: ShoppingBag },
  { href: "/customer/services", label: "Services", icon: Wrench },
  { href: "/customer/requests", label: "My Requests", icon: Package },
  { href: "/customer/orders", label: "My Orders", icon: Boxes },
  { href: "/customer/offers", label: "Offers", icon: Tag },
  { href: "/customer/favorites", label: "Favorites", icon: Heart },
];

const COMM_NAV = [
  { href: "/customer/messages", label: "Messages", icon: MessageSquare },
  { href: "/customer/notifications", label: "Notifications", icon: Bell },
];

const SUPPORT_NAV = [
  { href: "/customer/support", label: "Help & Support", icon: HelpCircle },
];

export default function CustomerSidebar({ mobileOpen, setMobileOpen, onOpenAiChat }: CustomerSidebarProps) {
  const pathname = usePathname() || "/customer";
  const [collapsed, setCollapsed] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Hydrate collapsed state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("nexbyte_sidebar_collapsed");
      if (saved === "true") {
        setCollapsed(true);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const toggleCollapsed = () => {
    const nextState = !collapsed;
    setCollapsed(nextState);
    try {
      localStorage.setItem("nexbyte_sidebar_collapsed", String(nextState));
    } catch (e) {
      // ignore
    }
  };

  const isActive = (href: string) => {
    if (href === "/customer") {
      return pathname === "/customer";
    }
    return pathname.startsWith(href);
  };

  const handleSignOutConfirm = async () => {
    setSigningOut(true);
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        await supabase.auth.signOut();
      }
      await fetch("/api/customer/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout error", e);
    } finally {
      document.cookie = "nexbyte_customer_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      setSigningOut(false);
      setShowSignOutModal(false);
      window.location.href = "/customer/signin";
    }
  };

  const renderNavItem = (item: { href: string; label: string; icon: any }, isMobile = false) => {
    const active = isActive(item.href);
    const IconComp = item.icon;

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => {
          if (isMobile) setMobileOpen(false);
        }}
        className={cn(
          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200",
          active
            ? "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-l-4 border-sky-600 shadow-sm"
            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
        )}
      >
        <IconComp
          className={cn(
            "h-4.5 w-4.5 shrink-0 transition-colors",
            active ? "text-sky-600 dark:text-sky-400" : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white"
          )}
        />
        {(!collapsed || isMobile) && (
          <span className="truncate tracking-tight">{item.label}</span>
        )}

        {/* Floating Tooltip when Desktop Sidebar Collapsed */}
        {collapsed && !isMobile && (
          <div className="absolute left-full ml-2.5 hidden rounded-lg bg-slate-900 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-white shadow-md group-hover:block z-50 whitespace-nowrap">
            {item.label}
          </div>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* DESKTOP FIXED LEFT SIDEBAR */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed top-0 left-0 bottom-0 z-40 bg-white dark:bg-slate-900 border-r border-[#E6EAF0] dark:border-white/10 transition-all duration-300 ease-in-out shadow-sm",
          collapsed ? "w-18" : "w-64"
        )}
      >
        {/* Top Branding Section */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#E6EAF0] dark:border-white/10 shrink-0">
          <Link href="/customer" className="flex items-center gap-3 group overflow-hidden">
            <div className="relative h-9 w-9 shrink-0">
              <Image
                src="/images/logo-icon-transparent.png"
                alt="NexByte Logo"
                fill
                sizes="36px"
                className="object-contain"
                priority
              />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-display text-base font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                  NEX<span className="text-sky-600">BYTE</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 tracking-wide mt-0.5">
                  Customer Portal
                </span>
              </div>
            )}
          </Link>

          {/* Collapse Toggle Button */}
          <button
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-800 transition-colors"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 no-scrollbar">
          {/* Main Navigation */}
          <div className="space-y-1">
            {!collapsed && (
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Main
              </span>
            )}
            {MAIN_NAV.map((item) => renderNavItem(item))}
          </div>

          <div className="h-px bg-[#E6EAF0] dark:bg-white/10 mx-2" />

          {/* Communication Section */}
          <div className="space-y-1">
            {!collapsed && (
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Communication
              </span>
            )}
            {COMM_NAV.map((item) => renderNavItem(item))}
          </div>

          <div className="h-px bg-[#E6EAF0] dark:bg-white/10 mx-2" />

          {/* Support & AI Section */}
          <div className="space-y-1">
            {!collapsed && (
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Support
              </span>
            )}
            {SUPPORT_NAV.map((item) => renderNavItem(item))}

            {/* Ask NexByte AI trigger button */}
            <button
              onClick={() => {
                if (onOpenAiChat) onOpenAiChat();
                else window.dispatchEvent(new CustomEvent("nexbyte-open-ai-chat"));
              }}
              className={cn(
                "group relative w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40",
                collapsed ? "justify-center" : ""
              )}
            >
              <Bot className="h-4.5 w-4.5 shrink-0 text-sky-600" />
              {!collapsed && <span>Ask NexByte AI</span>}

              {collapsed && (
                <div className="absolute left-full ml-2.5 hidden rounded-lg bg-slate-900 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-white shadow-md group-hover:block z-50 whitespace-nowrap">
                  Ask NexByte AI
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Bottom Profile & Logout Controls */}
        <div className="p-3 border-t border-[#E6EAF0] dark:border-white/10 space-y-1 shrink-0 bg-white dark:bg-slate-900">
          {renderNavItem({ href: "/customer/profile", label: "My Profile", icon: User })}
          {renderNavItem({ href: "/customer/settings", label: "Settings", icon: Settings })}

          <button
            onClick={() => setShowSignOutModal(true)}
            className={cn(
              "group relative w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all duration-200",
              collapsed ? "justify-center" : ""
            )}
          >
            <LogOut className="h-4.5 w-4.5 shrink-0 text-rose-600" />
            {!collapsed && <span>Sign Out</span>}

            {collapsed && (
              <div className="absolute left-full ml-2.5 hidden rounded-lg bg-slate-900 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-white shadow-md group-hover:block z-50 whitespace-nowrap">
                Sign Out
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* MOBILE SLIDE-IN DRAWER */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Slide Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-[#E6EAF0] dark:border-white/10 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-[#E6EAF0] dark:border-white/10">
                <div className="flex items-center gap-3">
                  <Image
                    src="/images/logo-icon-transparent.png"
                    alt="NexByte Logo"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                  <div>
                    <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-base">
                      NEX<span className="text-sky-600">BYTE</span>
                    </h3>
                    <p className="text-[10px] text-slate-500 font-medium">Customer Portal</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Navigation</span>
                  {MAIN_NAV.map((item) => renderNavItem(item, true))}
                </div>

                <div className="h-px bg-[#E6EAF0] dark:bg-white/10" />

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Messages &amp; Alerts</span>
                  {COMM_NAV.map((item) => renderNavItem(item, true))}
                </div>

                <div className="h-px bg-[#E6EAF0] dark:bg-white/10" />

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Support &amp; AI</span>
                  {SUPPORT_NAV.map((item) => renderNavItem(item, true))}
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      if (onOpenAiChat) onOpenAiChat();
                      else window.dispatchEvent(new CustomEvent("nexbyte-open-ai-chat"));
                    }}
                    className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40"
                  >
                    <Bot className="h-4.5 w-4.5 text-sky-600" />
                    <span>Ask NexByte AI</span>
                  </button>
                </div>
              </div>

              <div className="p-4 border-t border-[#E6EAF0] dark:border-white/10 space-y-1">
                {renderNavItem({ href: "/customer/profile", label: "My Profile", icon: User }, true)}
                {renderNavItem({ href: "/customer/settings", label: "Settings", icon: Settings }, true)}

                <button
                  onClick={() => {
                    setMobileOpen(false);
                    setShowSignOutModal(true);
                  }}
                  className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                >
                  <LogOut className="h-4.5 w-4.5 text-rose-600" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CONFIRMATION SIGN OUT MODAL */}
      <AnimatePresence>
        {showSignOutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-[#E6EAF0] dark:border-white/10 p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-amber-500">
                <div className="p-2.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">
                  Sign Out Confirmation
                </h3>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Sign out of your NexByte account? You will need to sign in again to access your orders, bookings, and profile.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowSignOutModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSignOutConfirm}
                  disabled={signingOut}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-colors disabled:opacity-50"
                >
                  {signingOut ? "Signing Out..." : "Sign Out"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
