"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Sun,
  Moon,
  ShoppingBag,
  LogOut,
  User,
  ChevronDown,
  Package,
  Calendar,
  GraduationCap,
  Briefcase,
  MessageSquare,
  Bell,
  Search,
  HelpCircle,
  Tag,
  Star,
  ShieldCheck,
  Heart,
  Sparkles,
  Home,
  Wrench,
  Grid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/lib/cartStore";
import GlobalSearchModal from "@/components/GlobalSearchModal";

// Clean Primary Navigation (Max 5 main links on desktop)
const PRIMARY_NAV_LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/products", label: "Shop", icon: ShoppingBag },
  { href: "/services", label: "Services", icon: Wrench },
  { href: "/customer/requests", label: "My Requests", icon: Package },
  { href: "/offers", label: "Offers", icon: Tag },
];

// Secondary Navigation ("More" Menu)
const SECONDARY_NAV_LINKS = [
  { href: "/training", label: "Training", icon: GraduationCap },
  { href: "/internship", label: "Internships", icon: Briefcase },
  { href: "/reviews", label: "Reviews", icon: Star },
  { href: "/verify", label: "Verify Certificate", icon: ShieldCheck },
  { href: "/contact", label: "Contact & Support", icon: HelpCircle },
  { href: "/customer/favorites", label: "Favorites", icon: Heart },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  useEffect(() => {
    const cookies = document.cookie.split(";").reduce((acc: Record<string, string>, c) => {
      const [k, v] = c.trim().split("=");
      if (k) acc[k] = v || "";
      return acc;
    }, {});
    setIsAuthenticated(!!cookies["nexbyte_customer_session"]);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Theme setting: light theme by default
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    if (savedTheme === "dark") {
      setTheme("dark");
      document.documentElement.classList.remove("light");
    } else {
      setTheme("light");
      document.documentElement.classList.add("light");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  };

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname === "/customer";
    }
    return pathname?.startsWith(href);
  };

  const cartOpen = useCartStore((s) => s.openCart);
  const cartItemCount = useCartStore((s) => s.getItemCount());

  return (
    <>
      {/* Sticky Compact Header */}
      <header
        className={cn(
          "fixed top-0 z-40 w-full transition-all duration-300 ease-out",
          scrolled
            ? "bg-white/85 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10 py-2.5 shadow-sm"
            : "bg-white/60 dark:bg-slate-950/60 backdrop-blur-md border-b border-slate-100 dark:border-white/5 py-3.5"
        )}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link href={isAuthenticated ? "/customer" : "/"} className="flex items-center gap-2.5 group shrink-0">
            <div className="relative h-9 w-9 sm:h-10 sm:w-10">
              <Image
                src="/images/logo-icon-transparent.png"
                alt="NexByte Technologies logo"
                fill
                sizes="40px"
                className="object-contain"
                priority
              />
            </div>
            <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              NEX<span className="text-nex-blue dark:text-nex-blueLight">BYTE</span>
            </span>
          </Link>

          {/* Primary Navigation Links (Desktop) */}
          <ul className="hidden lg:flex items-center gap-1.5">
            {PRIMARY_NAV_LINKS.map((link) => {
              const targetHref = link.href === "/" && isAuthenticated ? "/customer" : link.href;
              const linkActive = isActive(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={targetHref}
                    className={cn(
                      "px-3.5 py-1.5 text-xs font-bold transition-all rounded-full block",
                      linkActive
                        ? "bg-nex-blue text-white shadow-sm"
                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}

            {/* Secondary "More" Dropdown Menu */}
            <li className="relative">
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-all"
              >
                <span>More</span>
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", moreMenuOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {moreMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 mt-2 w-52 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-2 shadow-xl z-50"
                  >
                    {SECONDARY_NAV_LINKS.map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMoreMenuOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                        >
                          <IconComponent className="h-4 w-4 text-nex-blue dark:text-nex-blueLight shrink-0" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          </ul>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Smart Search"
              className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
            >
              <Search className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
              <span className="hidden sm:inline">What are you looking for?</span>
            </button>

            {/* Cart Icon */}
            <button
              onClick={cartOpen}
              aria-label="Shopping Cart"
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-white/5 text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
            >
              <ShoppingBag className="h-4 w-4" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-nex-blue text-[9px] font-bold text-white shadow-sm">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Notifications Icon (If authenticated) */}
            {isAuthenticated && (
              <Link
                href="/customer/notifications"
                aria-label="Notifications"
                className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-white/5 text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
              >
                <Bell className="h-4 w-4" />
              </Link>
            )}

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-white/5 text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4 text-slate-700" />
              ) : (
                <Sun className="h-4 w-4 text-amber-400" />
              )}
            </button>

            {/* Get Help CTA button */}
            <Link
              href="/contact"
              className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-nex-blue hover:bg-blue-600 text-white font-bold text-xs px-4 py-2 shadow-sm transition-all"
            >
              <HelpCircle className="h-3.5 w-3.5" /> Get Help
            </Link>

            {/* Profile / Account Dropdown */}
            {isAuthenticated ? (
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="flex items-center gap-1.5 rounded-full border border-nex-blue/30 bg-nex-blue/10 px-3 py-1.5 text-xs font-bold text-nex-blue dark:text-nex-blueLight transition-all"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>Profile</span>
                  <ChevronDown className={cn("h-3 w-3 transition-transform", accountMenuOpen && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {accountMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-2 shadow-xl z-50"
                    >
                      <Link
                        href="/customer/profile"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                      >
                        <User className="h-3.5 w-3.5 text-nex-blue" />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        href="/customer/requests"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                      >
                        <Package className="h-3.5 w-3.5 text-emerald-500" />
                        <span>My Requests &amp; Orders</span>
                      </Link>
                      <button
                        onClick={async () => {
                          setAccountMenuOpen(false);
                          await fetch("/api/customer/logout", { method: "POST" });
                          window.location.href = "/";
                        }}
                        className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors mt-1 border-t border-slate-100 dark:border-white/5"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/login?role=user"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white"
            >
              {mobileMenuOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Full Menu Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden overflow-hidden border-t border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-4 py-4 space-y-3"
            >
              <div className="grid grid-cols-2 gap-2 text-xs">
                {PRIMARY_NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-2 rounded-xl p-3 font-semibold",
                      isActive(link.href)
                        ? "bg-nex-blue text-white"
                        : "bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200"
                    )}
                  >
                    <link.icon className="h-4 w-4 shrink-0" />
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>

              <div className="border-t border-slate-200 dark:border-white/10 pt-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">More Options</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {SECONDARY_NAV_LINKS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-white/[0.02] p-2.5 text-slate-700 dark:text-slate-300 font-medium"
                    >
                      <item.icon className="h-4 w-4 text-nex-blue shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav aria-label="Mobile Navigation" className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 px-2 py-1.5 shadow-lg">
        <div className="grid grid-cols-5 items-center text-center">
          <Link
            href={isAuthenticated ? "/customer" : "/"}
            className={cn(
              "flex flex-col items-center gap-0.5 py-1 text-[10px] font-bold transition-colors",
              isActive("/") ? "text-nex-blue dark:text-nex-blueLight" : "text-slate-500 dark:text-slate-400"
            )}
          >
            <Home className="h-5 w-5" />
            <span>Home</span>
          </Link>

          <Link
            href="/products"
            className={cn(
              "flex flex-col items-center gap-0.5 py-1 text-[10px] font-bold transition-colors",
              isActive("/products") ? "text-nex-blue dark:text-nex-blueLight" : "text-slate-500 dark:text-slate-400"
            )}
          >
            <ShoppingBag className="h-5 w-5" />
            <span>Shop</span>
          </Link>

          <Link
            href="/services"
            className={cn(
              "flex flex-col items-center gap-0.5 py-1 text-[10px] font-bold transition-colors",
              isActive("/services") ? "text-nex-blue dark:text-nex-blueLight" : "text-slate-500 dark:text-slate-400"
            )}
          >
            <Wrench className="h-5 w-5" />
            <span>Services</span>
          </Link>

          <Link
            href="/customer/requests"
            className={cn(
              "flex flex-col items-center gap-0.5 py-1 text-[10px] font-bold transition-colors",
              isActive("/customer/requests") ? "text-nex-blue dark:text-nex-blueLight" : "text-slate-500 dark:text-slate-400"
            )}
          >
            <Package className="h-5 w-5" />
            <span>Requests</span>
          </Link>

          <Link
            href={isAuthenticated ? "/customer/profile" : "/login?role=user"}
            className={cn(
              "flex flex-col items-center gap-0.5 py-1 text-[10px] font-bold transition-colors",
              isActive("/customer/profile") || isActive("/login") ? "text-nex-blue dark:text-nex-blueLight" : "text-slate-500 dark:text-slate-400"
            )}
          >
            <User className="h-5 w-5" />
            <span>Account</span>
          </Link>
        </div>
      </nav>

      {/* Global Intent-Aware Search Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
