"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Boxes, Package, RefreshCw, ArrowRight, ExternalLink } from "lucide-react";
import { safeJsonFetch } from "@/lib/apiHelper";

export default function CustomerOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await safeJsonFetch("/api/customer/orders");
      if (res.ok && res.data?.orders) {
        setOrders(res.data.orders);
      }
    } catch (e) {
      console.error("Orders load error", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-[#E6EAF0] dark:border-white/10 p-6 sm:p-8 shadow-sm space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
          <Boxes className="h-3.5 w-3.5 text-emerald-600" /> Purchase History
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          My Orders
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
          Track hardware shipments, view digital invoices, and monitor delivery status for your computer purchases.
        </p>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="rounded-2xl border border-[#E6EAF0] dark:border-white/10 bg-white dark:bg-slate-900 p-12 text-center text-xs text-slate-500 space-y-2">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-sky-600" />
          <span>Fetching your order history...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-[#E6EAF0] dark:border-white/10 bg-white dark:bg-slate-900 p-12 text-center space-y-3 shadow-sm">
          <Package className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
            No orders found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven&apos;t placed any hardware orders yet. Explore our genuine laptop and desktop catalog.
          </p>
          <Link
            href="/customer/shop"
            className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 text-white font-bold text-xs px-4 py-2 shadow-sm hover:bg-sky-700 transition-colors"
          >
            <span>Browse Products</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => {
            const orderNum = ord.order_number || ord.order_id || `NEX-2026-${ord.id.slice(0, 4)}`;
            const dateStr = new Date(ord.created_at || Date.now()).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            const amount = (ord.total_amount || ord.total || 0).toLocaleString("en-IN");
            const status = ord.status || "Confirmed";

            return (
              <div
                key={ord.id}
                className="rounded-2xl border border-[#E6EAF0] dark:border-white/10 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-extrabold text-slate-900 dark:text-white">
                      Order #{orderNum}
                    </span>
                    <span className="rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold uppercase">
                      {status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Placed on: {dateStr}</p>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-white/5">
                  <div className="text-right">
                    <span className="font-display text-base font-extrabold text-slate-900 dark:text-white block">
                      ₹{amount}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Payment: Paid</span>
                  </div>

                  <button
                    onClick={() => {
                      alert(`Order #${orderNum}\nDate: ${dateStr}\nAmount: ₹${amount}\nStatus: ${status}`);
                    }}
                    className="inline-flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    <span>View Order</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
