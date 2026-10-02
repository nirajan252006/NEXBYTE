"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingBag,
  Bell,
  Menu,
  User,
  MapPin,
  ChevronDown,
  LogOut,
  Settings,
  Package,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/lib/cartStore";
import GlobalSearchModal from "@/components/GlobalSearchModal";

interface CustomerHeaderProps {
  onOpenMobileMenu: () => void;
}

export default function CustomerHeader({ onOpenMobileMenu }: CustomerHeaderProps) {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(1);

  const cartOpen = useCartStore((s) => s.openCart);
  const cartItemCount = useCartStore((s) => s.getItemCount());

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/customer/profile");
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setUserProfile(data.profile);
          setIsAuthenticated(true);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (e) {
      setIsAuthenticated(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "CU";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-[#E6EAF0] dark:border-white/10 px-4 sm:px-6 py-3 transition-all">
        <div className="flex items-center justify-between gap-3">
          
          {/* Left Section: Mobile Menu Toggle + Search Bar */}
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            {/* Mobile Hamburger Toggle */}
            <button
              onClick={onOpenMobileMenu}
              aria-label="Open sidebar menu"
              className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Smart Search Trigger Bar */}
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center gap-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors shadow-inner text-left"
            >
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="truncate">Search for laptops, services, CCTV, accessories...</span>
            </button>
          </div>

          {/* Right Utility Section */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Service Areas Tag */}
            <div className="hidden md:flex items-center gap-1.5 rounded-full border border-sky-200 dark:border-sky-900 bg-sky-50/80 dark:bg-sky-950/40 px-3 py-1 text-[11px] font-semibold text-sky-700 dark:text-sky-300">
              <MapPin className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
              <span>Bengaluru · Tumkur · Hiriyur (soon)</span>
            </div>

            {/* Cart Trigger */}
            <button
              onClick={cartOpen}
              aria-label="Shopping Cart"
              className="relative p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              <ShoppingBag className="h-4.5 w-4.5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-sky-600 text-[10px] font-bold text-white shadow-sm">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Notifications Bell */}
            <Link
              href="/customer/notifications"
              aria-label="Notifications"
              className="relative p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors hidden sm:flex"
            >
              <Bell className="h-4.5 w-4.5" />
              {unreadNotifs > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white shadow-sm">
                  {unreadNotifs}
                </span>
              )}
            </Link>

            {/* AUTHENTICATION / PROFILE BUTTON */}
            {isAuthenticated && userProfile ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-1.5 pr-3 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                >
                  <div className="h-7 w-7 rounded-lg bg-sky-600 text-white flex items-center justify-center text-xs font-bold shadow-sm overflow-hidden relative">
                    {userProfile.avatar_url ? (
                      <Image
                        src={userProfile.avatar_url}
                        alt={userProfile.full_name || "Customer"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      getInitials(userProfile.full_name)
                    )}
                  </div>
                  <span className="hidden md:inline font-bold truncate max-w-[120px]">
                    {userProfile.full_name?.split(" ")[0] || "Customer"}
                  </span>
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform text-slate-400", userDropdownOpen && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-2 shadow-xl z-50 space-y-1"
                    >
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-white/5">
                        <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {userProfile.full_name || "NexByte Customer"}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">{userProfile.email}</p>
                      </div>

                      <Link
                        href="/customer/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                      >
                        <User className="h-4 w-4 text-sky-600 shrink-0" />
                        <span>My Profile</span>
                      </Link>

                      <Link
                        href="/customer/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                      >
                        <Package className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span>My Orders &amp; Requests</span>
                      </Link>

                      <Link
                        href="/customer/settings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                      >
                        <Settings className="h-4 w-4 text-slate-500 shrink-0" />
                        <span>Account Settings</span>
                      </Link>

                      <div className="border-t border-slate-100 dark:border-white/5 pt-1">
                        <button
                          onClick={async () => {
                            setUserDropdownOpen(false);
                            await fetch("/api/customer/logout", { method: "POST" });
                            window.location.href = "/customer/signin";
                          }}
                          className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        >
                          <LogOut className="h-4 w-4 shrink-0" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* CRITICAL SIGN IN BUTTON REQUIREMENT (#14, #15) */
              <Link
                href="/customer/signin"
                className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-4 py-2 shadow-sm transition-all"
              >
                <User className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </Link>
            )}

          </div>
        </div>
      </header>

      {/* Global Intent-Aware Search Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
