"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Shield } from "lucide-react";

/**
 * AdminFloatingButton
 * ──────────────────
 * A premium glassmorphic floating admin access button in the bottom-left corner.
 * Hidden on /admin/* and /customer/* routes.
 */
export default function AdminFloatingButton() {
  const pathname = usePathname();
  const [hovered, setHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Do not show on admin or customer portal pages
  const shouldHide =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/customer") ||
    pathname?.startsWith("/my-bookings");

  if (shouldHide) return null;

  return (
    <div className="fixed bottom-5 left-5 z-[45] pointer-events-auto">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="relative"
        >
          {/* Tooltip */}
          {hovered && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="absolute left-full top-1/2 -translate-y-1/2 ml-3 bg-nex-ink/95 border border-nex-blue/30 text-white text-[10px] font-semibold px-2.5 py-1.5 rounded-lg shadow-glow-blue whitespace-nowrap"
            >
              Admin Portal
            </motion.div>
          )}

          {/* Glowing Background Pulse */}
          <div className="absolute inset-0 rounded-full bg-nex-blue/20 blur-md animate-pulse pointer-events-none" />

          {/* Button Link */}
          <Link
            href="/admin/login"
            aria-label="Access Admin Console"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-nex-black/85 backdrop-blur-xl border border-nex-blue/40 shadow-glow-blue transition-all duration-300 hover:border-nex-blueLight hover:shadow-glow-blue-lg text-nex-blueLight hover:text-white focus:outline-none focus:ring-2 focus:ring-nex-blueLight/50"
          >
            <Shield className="h-5 w-5 transition-transform duration-300 hover:rotate-[15deg]" />
          </Link>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
