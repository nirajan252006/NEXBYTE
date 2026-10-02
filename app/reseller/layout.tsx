"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, ShoppingBag, PlusCircle, Package,
  MessageSquare, BarChart3, User, Settings, Home, LogOut,
  Bell, Menu, X, Building2, ChevronRight
} from "lucide-react";
import { useState, useEffect } from "react";
import AiChatWidget from "@/components/AiChatWidget";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/reseller", icon: LayoutDashboard },
  { label: "My Products", href: "/reseller/products", icon: ShoppingBag },
  { label: "Add Product", href: "/reseller/products/add", icon: PlusCircle },
  { label: "Orders", href: "/reseller/orders", icon: Package },
  { label: "Messages", href: "/reseller/messages", icon: MessageSquare },
  { label: "Analytics", href: "/reseller/analytics", icon: BarChart3 },
  { label: "My Profile", href: "/reseller/profile", icon: User },
  { label: "Settings", href: "/reseller/settings", icon: Settings },
];

export default function ResellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [resellerName, setResellerName] = useState("Reseller");
  const [resellerEmail, setResellerEmail] = useState("");

  useEffect(() => {
    // Read display cookies (not httpOnly)
    if (typeof window !== "undefined") {
      const cookies = document.cookie.split(";").reduce((acc: Record<string, string>, c) => {
        const [k, v] = c.trim().split("=");
        if (k) acc[k] = v || "";
        return acc;
      }, {});
      const name = cookies["nexbyte_reseller_name"];
      const email = cookies["nexbyte_reseller_email"];
      if (name) setResellerName(decodeURIComponent(name));
      if (email) setResellerEmail(decodeURIComponent(email));
    }
  }, []);

  const isLoginPage = pathname === "/reseller/login";
  if (isLoginPage) return <>{children}</>;

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/reseller/logout", { method: "POST" });
      router.replace("/reseller/login");
    } catch {
      setLoggingOut(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-nex-black text-white overflow-hidden relative">
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-nex-ink border-r border-white/5 flex flex-col justify-between shrink-0 transform will-change-transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:translate-x-0 md:static ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 flex-1 flex flex-col min-h-0">
          {/* Brand */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600/20 to-nex-blue/20 border border-purple-600/30 text-purple-400">
                <Building2 className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="font-display text-sm font-bold text-white tracking-tight">NexByte</h2>
                <span className="text-[10px] text-purple-400 font-medium tracking-wide">RESELLER HUB</span>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Reseller info card */}
          <div className="mb-6 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-purple-600/15 border border-purple-600/20 flex items-center justify-center text-purple-400 font-bold text-sm">
                {resellerName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{resellerName}</p>
                <p className="text-[10px] text-nex-mist truncate">{resellerEmail}</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="space-y-0.5 flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 pb-4">
            {NAV_ITEMS.map((item) => {
              const isActive = item.href === "/reseller" ? pathname === "/reseller" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] font-medium tracking-wide transition-all ${isActive
                    ? "bg-white/[0.06] text-white"
                    : "text-white/50 hover:text-white hover:bg-white/[0.03]"
                  }`}
                >
                  <item.icon className={`h-4 w-4 shrink-0 transition-colors ${isActive ? "text-purple-400" : "text-white/40"}`} />
                  <span className="truncate">{item.label}</span>
                  {isActive && <ChevronRight className="h-3 w-3 ml-auto text-white/30" />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 mx-2 mb-2 border-t border-white/5 space-y-1">
          <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] font-medium text-white/50 hover:text-white hover:bg-white/[0.03] transition-colors">
            <Home className="h-4 w-4" /> Back to Website
          </Link>
          <button onClick={handleLogout} disabled={loggingOut}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] font-medium text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-colors text-left">
            <LogOut className="h-4 w-4" />
            {loggingOut ? "Logging out..." : "Log Out"}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-white/5 bg-nex-ink/80 backdrop-blur-xl px-4 md:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 -ml-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5">
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden md:flex items-center gap-2 text-xs text-white/50">
              <span>Reseller Hub</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-white font-semibold capitalize">
                {NAV_ITEMS.find(i => i.href === pathname || (i.href !== "/reseller" && pathname.startsWith(i.href)))?.label || "Dashboard"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-full hover:bg-white/5 transition-colors">
              <Bell className="h-4 w-4 text-white/70" />
            </button>
            <div className="h-8 w-8 rounded-lg bg-purple-600/15 border border-purple-600/20 flex items-center justify-center text-purple-400 font-bold text-sm">
              {resellerName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-premium-mesh scrollbar-thin scrollbar-thumb-white/10">
          {children}
        </main>
        <AiChatWidget portal="reseller" />
      </div>
    </div>
  );
}
