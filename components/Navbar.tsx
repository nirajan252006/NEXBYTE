"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, Bell, ShieldCheck, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { dbHelper } from "@/lib/dbHelper";

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
  const [isAdmin, setIsAdmin] = useState(false);
  const [newBookings, setNewBookings] = useState<any[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [adminHovered, setAdminHovered] = useState(false);

  const loadNewBookings = async () => {
    try {
      const list = await dbHelper.bookings.list();
      setNewBookings(list.filter((b: any) => b.status === "new"));
    } catch {}
  };

  useEffect(() => {
    // Check admin session cookie
    const cookies = document.cookie.split(";").reduce((acc: Record<string, string>, c) => {
      const [k, v] = c.trim().split("=");
      if (k) acc[k] = v || "";
      return acc;
    }, {});
    const adminSessionActive = !!cookies["nexbyte_admin_session"];
    setIsAdmin(adminSessionActive);

    if (adminSessionActive) {
      loadNewBookings();
      const handleRealtime = () => loadNewBookings();
      window.addEventListener("nexbyte-realtime", handleRealtime);
      return () => window.removeEventListener("nexbyte-realtime", handleRealtime);
    }
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
      return pathname === "/";
    }
    return pathname?.startsWith(href);
  };

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
        <Link href="/" className="flex items-center gap-2.5 group">
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
          {NAV_LINKS.map((link) => (
            <li key={link.href} className="relative">
              <Link
                href={link.href}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium transition-colors rounded-full block",
                  isActive(link.href)
                    ? "text-white"
                    : "text-nex-mist hover:text-white"
                )}
              >
                {isActive(link.href) && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-full bg-white/[0.06] border border-nex-blue/30 shadow-glow-blue"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center gap-3">
          {/* Notification Bell for Admin */}
          {isAdmin && (
            <div className="relative">
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                aria-label="New Bookings Notifications"
                className="relative flex h-10 w-10 items-center justify-center rounded-full glass-panel text-white hover:border-nex-blue/50 transition-colors"
              >
                <Bell className="h-4.5 w-4.5" />
                {newBookings.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 animate-bounce items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-glow-blue">
                    {newBookings.length}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-white/10 bg-nex-ink/95 backdrop-blur-xl p-4 shadow-[0_0_30px_rgba(30,94,255,0.25)] z-50">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                    <h4 className="text-xs font-bold text-white">New Bookings ({newBookings.length})</h4>
                    <Link href="/admin/bookings" onClick={() => setShowNotifDropdown(false)} className="text-[10px] text-nex-blueLight hover:underline font-semibold">
                      View all
                    </Link>
                  </div>
                  {newBookings.length === 0 ? (
                    <p className="text-[10px] text-nex-mist text-center py-4">No new bookings.</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                      {newBookings.map((b) => (
                        <Link
                          key={b.id}
                          href="/admin/bookings"
                          onClick={() => setShowNotifDropdown(false)}
                          className="block p-2 rounded-xl bg-white/[0.02] border border-white/5 hover:border-nex-blue/30 hover:bg-nex-blue/[0.03] transition-all text-left"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-[10px] font-bold text-white truncate max-w-[150px]">{b.customerName}</span>
                            <span className="text-[8px] font-mono font-bold text-nex-blueLight">{b.bookingId}</span>
                          </div>
                          <p className="text-[9px] text-nex-mist truncate mt-0.5">{b.productName}</p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

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

          {/* Admin Access Button (Desktop) */}
          <Link
            href="/admin/login"
            className="flex items-center justify-center gap-1.5 rounded-full border border-nex-blue/20 bg-nex-blue/[0.03] text-[12px] font-semibold text-nex-blueLight transition-all duration-300 hover:scale-[1.02] hover:bg-nex-blue/[0.08] hover:border-nex-blue/40 px-4 h-10 hover:shadow-[0_0_12px_rgba(30,94,255,0.15)]"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <Lock className="h-3 w-3 -ml-0.5" />
            <span>Admin</span>
          </Link>

          <Link href="/contact" className="btn-secondary !py-2.5 !px-5 text-xs">
            Contact
          </Link>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("nexbyte-open-booking-modal"))}
            className="btn-primary !py-2.5 !px-5 text-xs cursor-pointer"
          >
            Get a Quote
          </button>
        </div>

        <div className="lg:hidden flex items-center gap-3">
          {/* Mobile Admin Notification Bell */}
          {isAdmin && (
            <Link
              href="/admin/bookings"
              aria-label="New Bookings"
              className="relative flex h-10 w-10 items-center justify-center rounded-full glass-panel text-white"
            >
              <Bell className="h-4.5 w-4.5" />
              {newBookings.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 animate-bounce items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-glow-blue">
                  {newBookings.length}
                </span>
              )}
            </Link>
          )}

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
                <Link
                  href="/admin/login"
                  onClick={() => setOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 mt-2 rounded-xl text-sm font-semibold transition-all duration-300 border border-nex-blue/20 bg-nex-blue/[0.03] text-nex-blueLight hover:bg-nex-blue/[0.08]"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <Lock className="h-3.5 w-3.5 -ml-1" />
                  <span>Admin Login</span>
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
