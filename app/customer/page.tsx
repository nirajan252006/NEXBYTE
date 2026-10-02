"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  Laptop,
  Wrench,
  Cpu,
  ShieldCheck,
  Wifi,
  Headphones,
  ArrowRight,
  Package,
  Calendar,
  MessageSquare,
  Sparkles,
  ShoppingBag,
  Star,
  CheckCircle2,
} from "lucide-react";
import { safeJsonFetch } from "@/lib/apiHelper";
import { useCartStore } from "@/lib/cartStore";
import GlobalSearchModal from "@/components/GlobalSearchModal";

export default function CustomerDashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);

  const cartAddItem = useCartStore((s) => s.addItem);
  const cartOpen = useCartStore((s) => s.openCart);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Profile
      const profRes = await safeJsonFetch("/api/customer/profile");
      if (profRes.ok && profRes.data?.profile) {
        setProfile(profRes.data.profile);
      }

      // 2. Fetch Orders & Bookings in parallel
      const [ordRes, bookRes, msgRes] = await Promise.all([
        safeJsonFetch("/api/customer/orders"),
        safeJsonFetch("/api/customer/bookings"),
        safeJsonFetch("/api/customer/messages"),
      ]);

      const activities: any[] = [];

      if (ordRes.ok && ordRes.data?.orders?.length) {
        ordRes.data.orders.slice(0, 3).forEach((o: any) => {
          activities.push({
            id: o.id,
            title: `Order #${o.order_number || o.id.slice(0, 8)}`,
            subtitle: `Total: ₹${(o.total_amount || 0).toLocaleString("en-IN")}`,
            status: o.status || "Confirmed",
            date: o.created_at || new Date().toISOString(),
            type: "order",
            link: "/customer/orders",
          });
        });
      }

      if (bookRes.ok && bookRes.data?.bookings?.length) {
        bookRes.data.bookings.slice(0, 3).forEach((b: any) => {
          activities.push({
            id: b.id,
            title: b.selected_item || "Device Service & Repair",
            subtitle: `ID: ${b.booking_id || b.id.slice(0, 8)}`,
            status: b.status || "In Progress",
            date: b.created_at || new Date().toISOString(),
            type: "booking",
            link: "/customer/requests",
          });
        });
      }

      if (msgRes.ok && msgRes.data?.messages?.length) {
        msgRes.data.messages.slice(0, 2).forEach((m: any) => {
          activities.push({
            id: m.id,
            title: m.subject || "Support Inquiry",
            subtitle: m.message ? m.message.slice(0, 40) + "..." : "Message sent",
            status: m.status || "Sent",
            date: m.created_at || new Date().toISOString(),
            type: "message",
            link: "/customer/messages",
          });
        });
      }

      activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentActivities(activities.slice(0, 5));

      // 3. Recommended products catalog
      setRecommendedProducts([
        {
          id: "rec-1",
          name: "NexByte ROG Slayer R15 Gaming PC",
          category: "Gaming PC",
          price: 98500,
          originalPrice: 109999,
          badge: "-10% OFF",
          image: "/images/hero-pc-transparent.png",
        },
        {
          id: "rec-2",
          name: "MacBook Pro 16\" M1 Pro (Pre-Owned)",
          category: "Laptops",
          price: 115000,
          originalPrice: 122000,
          badge: "-5% OFF",
          image: "/images/service-repair-transparent.png",
        },
        {
          id: "rec-3",
          name: "Lenovo ThinkPad T490 (Refurbished)",
          category: "Business Laptop",
          price: 28500,
          originalPrice: 32000,
          badge: "-10% OFF",
          image: "/images/hero-pc-transparent.png",
        },
        {
          id: "rec-4",
          name: "Dell Latitude 5440 Business Laptop",
          category: "Laptops",
          price: 52000,
          originalPrice: 56000,
          badge: "NEW",
          image: "/images/service-repair-transparent.png",
        },
      ]);
    } catch (e) {
      console.error("Dashboard load error", e);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const customerName = profile?.full_name ? profile.full_name.split(" ")[0] : "Customer";

  const QUICK_ACTIONS = [
    {
      id: "buy",
      title: "Buy a Computer",
      description: "Find laptops, desktops and accessories.",
      btnText: "Browse Products",
      icon: Laptop,
      link: "/customer/shop",
      badgeColor: "bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400",
    },
    {
      id: "repair",
      title: "Repair My Device",
      description: "Laptop, desktop and hardware problems.",
      btnText: "Book Repair",
      icon: Wrench,
      link: "/customer/services",
      badgeColor: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
    },
    {
      id: "upgrade",
      title: "Upgrade My Computer",
      description: "RAM, SSD and performance upgrades.",
      btnText: "Upgrade",
      icon: Cpu,
      link: "/customer/services",
      badgeColor: "bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400",
    },
    {
      id: "cctv",
      title: "CCTV & Security",
      description: "Cameras, installation and setup.",
      btnText: "Explore CCTV",
      icon: ShieldCheck,
      link: "/customer/services",
      badgeColor: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
    },
    {
      id: "wifi",
      title: "WiFi & Networking",
      description: "Internet, router and office networking help.",
      btnText: "Get Help",
      icon: Wifi,
      link: "/customer/services",
      badgeColor: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
    },
    {
      id: "expert",
      title: "Talk to an Expert",
      description: "Ask a NexByte technician.",
      btnText: "Contact Us",
      icon: Headphones,
      link: "/customer/messages",
      badgeColor: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400",
    },
  ];

  return (
    <div className="space-y-8">
      {/* 1. GREETING & HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 p-6 sm:p-8 text-white shadow-lg">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 h-64 w-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md px-3 py-1 text-xs font-bold text-white mb-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" /> Welcome to NexByte Customer Portal
          </div>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            {getGreeting()}, {customerName}
          </h1>
          <p className="text-sm sm:text-base text-sky-100 font-medium">
            What can we help you with today?
          </p>
        </div>

        {/* Integrated Dashboard Search Bar */}
        <div className="mt-6 relative max-w-xl">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center justify-between rounded-2xl bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-200 px-4 py-3 text-xs sm:text-sm font-medium shadow-xl hover:bg-white transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <Search className="h-4 sm:h-5 w-4 sm:w-5 text-sky-600 shrink-0" />
              <span>What are you looking for? (Laptop, SSD upgrade, CCTV...)</span>
            </div>
            <span className="hidden sm:inline-block rounded-lg bg-sky-100 dark:bg-sky-950 px-2.5 py-1 text-[11px] font-bold text-sky-700 dark:text-sky-300">
              Search
            </span>
          </button>
        </div>
      </div>

      {/* 2. QUICK ACTIONS GRID (UNIFIED NEUTRAL WHITE CARDS) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            Quick Actions
          </h2>
          <span className="text-xs text-slate-500 font-medium">Choose a service or product category</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {QUICK_ACTIONS.map((action) => {
            const IconComp = action.icon;
            return (
              <div
                key={action.id}
                className="group relative rounded-2xl border border-[#E6EAF0] dark:border-white/10 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className={`p-3 rounded-2xl ${action.badgeColor} transition-transform group-hover:scale-105`}>
                    <IconComp className="h-6 w-6" />
                  </div>
                  <Link
                    href={action.link}
                    className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 dark:text-sky-400 group-hover:translate-x-1 transition-transform"
                  >
                    <span>{action.btnText}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <div>
                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    {action.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. RECENT ACTIVITY SECTION */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            Recent Activity
          </h2>
          <Link href="/customer/requests" className="text-xs font-bold text-sky-600 hover:underline">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-[#E6EAF0] dark:border-white/10 bg-white dark:bg-slate-900 p-8 text-center text-xs text-slate-400">
            Loading recent activity...
          </div>
        ) : recentActivities.length === 0 ? (
          <div className="rounded-2xl border border-[#E6EAF0] dark:border-white/10 bg-white dark:bg-slate-900 p-8 text-center space-y-3 shadow-sm">
            <Package className="h-10 w-10 text-slate-300 mx-auto" />
            <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">
              No recent activity
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven&apos;t placed any hardware orders or booked service requests yet.
            </p>
            <Link
              href="/customer/shop"
              className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 text-white font-bold text-xs px-4 py-2 shadow-sm hover:bg-sky-700 transition-colors"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Explore NexByte</span>
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-[#E6EAF0] dark:border-white/10 bg-white dark:bg-slate-900 divide-y divide-[#E6EAF0] dark:divide-white/5 shadow-sm overflow-hidden">
            {recentActivities.map((act) => (
              <div key={act.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 shrink-0">
                    {act.type === "order" ? <Package className="h-5 w-5" /> : act.type === "booking" ? <Wrench className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
                  </div>
                  <div>
                    <h4 className="font-display text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {act.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">{act.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right shrink-0">
                  <div>
                    <span className="inline-block rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                      {act.status}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(act.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <Link href={act.link} className="p-2 text-slate-400 hover:text-sky-600">
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. RECOMMENDED FOR YOU */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            Recommended for You
          </h2>
          <Link href="/customer/shop" className="text-xs font-bold text-sky-600 hover:underline">
            View All Products →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendedProducts.map((prod) => (
            <div
              key={prod.id}
              className="rounded-2xl border border-[#E6EAF0] dark:border-white/10 bg-white dark:bg-slate-900 p-4 shadow-sm hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="relative h-36 w-full rounded-xl bg-slate-50 dark:bg-slate-950 overflow-hidden flex items-center justify-center p-2 mb-3">
                  <span className="absolute top-2 left-2 rounded-md bg-rose-600 text-white px-2 py-0.5 text-[9px] font-bold">
                    {prod.badge}
                  </span>
                  <Image
                    src={prod.image}
                    alt={prod.name}
                    width={140}
                    height={110}
                    className="object-contain max-h-28 group-hover:scale-105 transition-transform"
                  />
                </div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                  {prod.category}
                </span>
                <h3 className="font-display text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                  {prod.name}
                </h3>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
                <div>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white block">
                    ₹{prod.price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] text-slate-400 line-through">
                    ₹{prod.originalPrice.toLocaleString("en-IN")}
                  </span>
                </div>
                <button
                  onClick={() => {
                    cartAddItem({
                      id: prod.id,
                      title: prod.name,
                      price: prod.price,
                      image: prod.image,
                      category: prod.category,
                    });
                    cartOpen();
                  }}
                  className="rounded-xl bg-sky-600 hover:bg-sky-700 text-white p-2 shadow-sm transition-colors"
                  aria-label="Add to cart"
                >
                  <ShoppingBag className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Global Intent-Aware Search Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
