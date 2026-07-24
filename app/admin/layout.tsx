"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  MessageSquare,
  Home,
  LogOut,
  Shield,
  LayoutDashboard,
  Calendar,
  ShoppingBag,
  Wrench,
  GraduationCap,
  BookOpen,
  Users,
  Archive,
  FileText,
  Globe,
  Bell,
  BarChart3,
  Image,
  Settings,
  Mail,
  Laptop,
  AlertCircle,
  Award,
  QrCode,
  MapPin,
  UserCheck,
  Menu,
  X
} from "lucide-react";
import { useState, useEffect, useMemo, Suspense } from "react";
import { realtimeSync } from "@/lib/realtimeSync";
import { useAutoLogout } from "@/lib/useAutoLogout";
import { useNotificationStore } from "@/lib/notificationStore";

const STATIC_NAV_ITEMS = [
  { label: "Overview Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Bookings Logs", href: "/admin/bookings", icon: Calendar },
  { label: "Products Catalog", href: "/admin/products", icon: ShoppingBag },
  { label: "IT Services", href: "/admin/services", icon: Wrench },
  { label: "Reviews Feed", href: "/admin/reviews", icon: MessageSquare },
  { label: "Customers Directory", href: "/admin/customers", icon: Users },
  { label: "Internship Applications", href: "/admin/internships", icon: GraduationCap },
  { label: "Training Enrollments", href: "/admin/training", icon: BookOpen },
  { label: "Contact Enquiries", href: "/admin/contacts", icon: Mail },
  { label: "Laptop Enquiries", href: "/admin/laptop-enquiries", icon: Laptop },
  { label: "Inventory Alerts", href: "/admin/inventory", icon: Archive },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "System Reports", href: "/admin/reports", icon: FileText },
  { label: "Notifications", href: "/admin/notifications", icon: Bell, hasBadge: true },
  { label: "Gallery Manager", href: "/admin/gallery", icon: Image },
  { label: "Certificates Manager", href: "/admin/certificates", icon: Award },
  { label: "QR Generator", href: "/admin/qr-generator", icon: QrCode },
  { label: "Admin Users", href: "/admin/users", icon: UserCheck },
  { label: "Branch Settings", href: "/admin/branches", icon: MapPin },
  { label: "Website CMS", href: "/admin/website-cms", icon: Globe },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const { showWarning, countdown, dismissWarning, logout: autoLogout } = useAutoLogout();

  useEffect(() => {
    fetchNotifications();

    // Init realtime sync
    realtimeSync.init();

    // Listen for realtime changes to refresh unread count
    const handleRealtime = () => fetchNotifications();
    if (typeof window !== "undefined") {
      window.addEventListener("nexbyte-realtime", handleRealtime);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("nexbyte-realtime", handleRealtime);
      }
    };
  }, [fetchNotifications]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const res = await fetch("/api/admin/logout", { method: "POST" });
      if (res.ok) {
        router.replace("/admin/login");
      }
    } catch (e) {
      console.error("Logout failed:", e);
    } finally {
      setLoggingOut(false);
    }
  };

  const navItems = useMemo(() => {
    return STATIC_NAV_ITEMS.map((item) =>
      item.hasBadge ? { ...item, badge: unreadCount } : item
    );
  }, [unreadCount]);

  // If on login page, don't show the sidebar navigation
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-nex-black text-white overflow-hidden relative">
      {/* Auto-logout warning overlay */}
      {showWarning && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative glass-panel bg-nex-ink border border-yellow-500/30 rounded-2xl p-8 max-w-sm text-center shadow-[0_8px_32px_rgba(245,158,11,0.2)]">
            <AlertCircle className="h-12 w-12 text-yellow-400 mx-auto mb-4 animate-pulse" />
            <h3 className="font-display text-lg font-bold text-white mb-2">Session Expiring</h3>
            <p className="text-xs text-nex-mist mb-4">
              You will be automatically logged out in <span className="text-yellow-400 font-bold text-base">{countdown}s</span> due to inactivity.
            </p>
            <div className="flex gap-2 justify-center">
              <button onClick={dismissWarning} className="btn-primary !py-2 !px-6 text-xs">
                Stay Logged In
              </button>
              <button onClick={autoLogout} className="btn-secondary !py-2 !px-4 text-xs text-red-400">
                Log Out Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar Navigation - GPU Accelerated Off-canvas */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-white/5 bg-nex-ink flex flex-col justify-between shrink-0 transform will-change-transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:translate-x-0 md:static ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 flex-1 flex flex-col min-h-0">
          {/* Logo Brand */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-nex-blueLight/20 to-nex-blue/20 text-nex-blueLight border border-nex-blue/30 shadow-[0_0_15px_rgba(30,94,255,0.15)]">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-sm font-bold text-white tracking-tight">
                  NexByte
                </h2>
                <span className="text-[10px] text-nex-mist font-medium tracking-wide">ADMIN CONSOLE</span>
              </div>
            </div>
            {/* Close button (Mobile only) */}
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="space-y-0.5 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20 pb-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] font-medium tracking-wide transition-all ${
                    isActive
                      ? "bg-white/[0.06] text-white shadow-sm"
                      : "text-white/50 hover:text-white hover:bg-white/[0.03]"
                  }`}
                >
                  <item.icon className={`h-4 w-4 shrink-0 transition-colors ${isActive ? 'text-nex-blueLight' : 'text-white/40'}`} />
                  <span className="truncate">{item.label}</span>
                  {(item as any).badge > 0 && (
                    <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-nex-blue text-[9px] font-bold text-white px-1 shadow-[0_0_8px_rgba(30,94,255,0.4)]">
                      {(item as any).badge > 99 ? "99+" : (item as any).badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="p-4 mx-2 mb-2 border-t border-white/5 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] font-medium text-white/50 hover:text-white hover:bg-white/[0.03] transition-colors"
          >
            <Home className="h-4 w-4" />
            Back to Website
          </Link>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] font-medium text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-colors text-left"
          >
            <LogOut className="h-4 w-4" />
            {loggingOut ? "Logging out..." : "Log Out"}
          </button>
        </div>
      </aside>

      {/* Main dashboard content container */}
      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-hidden">
        {/* Header Navigation */}
        <header className="h-16 border-b border-white/5 bg-nex-ink/80 backdrop-blur-xl px-4 md:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-display text-sm font-semibold text-white tracking-wide hidden md:block">
              {navItems.find(item => item.href === pathname)?.label || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Notification badge */}
            <Link href="/admin/notifications" className="relative p-2 rounded-full hover:bg-white/5 transition-colors">
              <Bell className="h-4.5 w-4.5 text-white/70" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-nex-blueLight shadow-[0_0_8px_rgba(74,140,255,0.8)]" />
              )}
            </Link>
            
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="hidden md:flex text-[12px] font-medium text-white/60 hover:text-white transition-colors ml-2"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-premium-mesh scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="h-8 w-8 rounded-full border-2 border-nex-blueLight border-t-transparent animate-spin" />
                <p className="text-[11px] text-nex-mist font-medium">Loading Workspace...</p>
              </div>
            </div>
          }>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
