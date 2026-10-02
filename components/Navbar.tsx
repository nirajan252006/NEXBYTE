"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, ShoppingBag, LogOut, User, ChevronDown, Package, Calendar, GraduationCap, Briefcase, MessageSquare, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/lib/cartStore";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/services", label: "Services" },
  { href: "/training", label: "Training" },
  { href: "/internship", label: "Internships" },
  { href: "/verify", label: "Verify Certificate" },
  { href: "/track", label: "Track Request" },
  { href: "/reviews", label: "Reviews" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  useEffect(() => {
    const cookies = document.cookie.split(";").reduce((acc: Record<string, string>, c) => {
      const [k, v] = c.trim().split("=");
      if (k) acc[k] = v || "";
      return acc;
    }, {});
    setIsAuthenticated(!!cookies["nexbyte_customer_session"]);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "light") {
        document.documentElement.classList.add("light");
      } else {
        document.documentElement.classList.remove("light");
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
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
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300 ease-out",
        scrolled
          ? "bg-nex-black/60 backdrop-blur-2xl border-b border-white/[0.04] py-3 shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
          : "bg-transparent py-5"
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href={isAuthenticated ? "/customer" : "/"} className="flex items-center gap-2.5 group">
          <div className="relative h-10 w-10 sm:h-11 sm:w-11">
            <div className="absolute inset-0 rounded-full bg-nex-blue/30 blur-md group-hover:bg-nex-blue/50 transition-colors" />
            <Image
              src="/images/logo-icon-transparent.png"
              alt="NexByte Technologies logo"
              fill
              sizes="44px"
              className="relative object-contain"
              priority
            />
          </div>
          <span className="font-display text-lg sm:text-xl font-bold tracking-tight">
            NEX<span className="text-nex-blueLight">BYTE</span>
          </span>
        </Link>

        <ul className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const targetHref = link.href === "/" && isAuthenticated ? "/customer" : link.href;
            const linkActive = isActive(link.href);
            return (
              <li key={link.href} className="relative">
                <Link
                  href={targetHref}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium transition-colors rounded-full block",
                    linkActive
                      ? "text-white"
                      : "text-nex-mist hover:text-white"
                  )}
                >
                  {linkActive && (
                    <motion.span
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-full bg-white/[0.06] border border-nex-blue/30 shadow-glow-blue"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden lg:flex items-center gap-3">
          {/* Cart Icon Button */}
          <button
            onClick={cartOpen}
            aria-label="Shopping Cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full glass-panel text-white hover:border-nex-blue/50 transition-colors"
          >
            <ShoppingBag className="h-4.5 w-4.5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-nex-blue text-[9px] font-bold text-white shadow-glow-blue">
                {cartItemCount}
              </span>
            )}
          </button>

          {/* Light/Dark Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="flex h-10 w-10 items-center justify-center rounded-full glass-panel text-white hover:border-nex-blue/50 transition-colors mr-1"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-yellow-400" />
            ) : (
              <Moon className="h-4 w-4 text-nex-blueLight" />
            )}
          </button>

          <Link href="/contact" className="btn-secondary !py-2.5 !px-5 text-xs">
            Contact
          </Link>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("nexbyte-open-booking-modal"))}
            className="btn-primary !py-2.5 !px-5 text-xs cursor-pointer"
          >
            Get a Quote
          </button>

          {/* Account Control Menu */}
          {isAuthenticated && (
            <div className="relative">
              <button
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className="flex items-center justify-center gap-1.5 rounded-full border border-nex-blue/30 bg-nex-blue/10 text-[12px] font-medium text-white transition-all duration-300 hover:bg-nex-blue/20 px-3.5 h-10 shadow-glow-blue"
              >
                <User className="h-4 w-4 text-nex-blueLight" />
                <span>Account</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${accountMenuOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {accountMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-52 rounded-2xl border border-white/10 bg-nex-ink/95 backdrop-blur-xl p-2 shadow-2xl z-50"
                  >
                    <div className="px-3 py-2 border-b border-white/[0.06] mb-1">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-nex-mist">Authenticated Customer</p>
                      <p className="text-xs font-semibold text-white truncate">My Account Portal</p>
                    </div>

                    <Link
                      href="/customer/profile"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-nex-mist hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <User className="h-3.5 w-3.5 text-nex-blueLight" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      href="/customer/orders"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-nex-mist hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <Package className="h-3.5 w-3.5 text-emerald-400" />
                      <span>My Orders</span>
                    </Link>

                    <Link
                      href="/customer/bookings"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-nex-mist hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <Calendar className="h-3.5 w-3.5 text-purple-400" />
                      <span>My Bookings</span>
                    </Link>

                    <Link
                      href="/customer/internships"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-nex-mist hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <Briefcase className="h-3.5 w-3.5 text-amber-400" />
                      <span>My Applications</span>
                    </Link>

                    <Link
                      href="/customer/training"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-nex-mist hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <GraduationCap className="h-3.5 w-3.5 text-cyan-400" />
                      <span>My Training</span>
                    </Link>

                    <Link
                      href="/customer/favorites"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-nex-mist hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <User className="h-3.5 w-3.5 text-red-400" />
                      <span>Favorites</span>
                    </Link>

                    <Link
                      href="/customer/messages"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-nex-mist hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-blue-400" />
                      <span>Messages</span>
                    </Link>

                    <Link
                      href="/customer/notifications"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-nex-mist hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <Bell className="h-3.5 w-3.5 text-yellow-400" />
                      <span>Notifications</span>
                    </Link>

                    <div className="my-1 border-t border-white/[0.06]" />

                    <button
                      onClick={async () => {
                        setAccountMenuOpen(false);
                        await fetch("/api/customer/logout", { method: "POST" });
                        window.location.href = "/";
                      }}
                      className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div className="lg:hidden flex items-center gap-3">
          {/* Mobile Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="flex h-10 w-10 items-center justify-center rounded-full glass-panel text-white hover:border-nex-blue/50 transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-yellow-400" />
            ) : (
              <Moon className="h-4 w-4 text-nex-blueLight" />
            )}
          </button>
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full glass-panel"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="lg:hidden overflow-hidden bg-nex-black/95 backdrop-blur-xl border-t border-white/[0.06]"
          >
            <ul className="flex flex-col gap-1 px-5 py-4">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block rounded-xl px-4 py-3 text-sm font-medium",
                      isActive(link.href)
                        ? "bg-white/[0.06] text-white border border-nex-blue/30"
                        : "text-nex-mist"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <Link
                  href="/contact"
                  onClick={() => setOpen(false)}
                  className="btn-secondary w-full text-center py-2.5 mb-2 block"
                >
                  Contact Us
                </Link>
                <button
                  onClick={() => {
                    setOpen(false);
                    window.dispatchEvent(new CustomEvent("nexbyte-open-booking-modal"));
                  }}
                  className="btn-primary w-full text-center py-2.5 block cursor-pointer"
                >
                  Get a Quote
                </button>
                {isAuthenticated && (
                  <button
                    onClick={async () => {
                      setOpen(false);
                      await fetch("/api/customer/logout", { method: "POST" });
                      window.location.href = "/";
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 mt-2 rounded-xl text-sm font-semibold transition-all duration-300 border border-white/10 bg-white/[0.03] text-nex-mist hover:text-white hover:bg-white/[0.06]"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                )}
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
