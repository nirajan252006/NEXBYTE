"use client";

import { useState } from "react";
import Link from "next/link";
import { Tag, Copy, Check, ShoppingBag, Wrench, ShieldCheck, Sparkles } from "lucide-react";

const OFFERS_LIST = [
  {
    id: "off-1",
    title: "10% OFF Computer Accessories",
    description: "Get flat 10% instant discount on gaming keyboards, mice, Wi-Fi routers, and RAM modules.",
    code: "NEX10",
    discount: "10% OFF",
    category: "Shop Products",
    actionLink: "/customer/shop",
    actionText: "Shop Now",
    icon: ShoppingBag,
    validUntil: "Dec 31, 2026",
  },
  {
    id: "off-2",
    title: "₹1,000 OFF Laptop Repair & Overhaul",
    description: "Save ₹1,000 on thermal repasting, motherboard diagnosis, and liquid damage recovery.",
    code: "REPAIR1000",
    discount: "₹1,000 OFF",
    category: "Services",
    actionLink: "/customer/services",
    actionText: "Book Service",
    icon: Wrench,
    validUntil: "Dec 31, 2026",
  },
  {
    id: "off-3",
    title: "Free CCTV Site Survey & Consultation",
    description: "Zero cost doorstep camera layout survey and HD camera system installation plan in Bengaluru.",
    code: "FREECCTV",
    discount: "FREE SURVEY",
    category: "CCTV Systems",
    actionLink: "/customer/services",
    actionText: "Explore CCTV",
    icon: ShieldCheck,
    validUntil: "Ongoing",
  },
];

export default function CustomerOffersPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-[#E6EAF0] dark:border-white/10 p-6 sm:p-8 shadow-sm space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
          <Tag className="h-3.5 w-3.5 text-amber-500" /> Active Deals &amp; Coupons
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Exclusive Customer Offers
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
          Copy promo codes and apply them during checkout or service booking to unlock instant savings on genuine hardware and technician repairs.
        </p>
      </div>

      {/* Offers List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {OFFERS_LIST.map((offer) => {
          const IconComp = offer.icon;
          const isCopied = copiedCode === offer.code;

          return (
            <div
              key={offer.id}
              className="rounded-2xl border border-[#E6EAF0] dark:border-white/10 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600">
                    <IconComp className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 px-3 py-1 text-xs font-extrabold">
                    {offer.discount}
                  </span>
                </div>

                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  {offer.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {offer.description}
                </p>
              </div>

              {/* Coupon Box & Action */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-800">
                  <span className="font-mono text-xs font-extrabold tracking-widest text-sky-700 dark:text-sky-300 pl-2">
                    {offer.code}
                  </span>
                  <button
                    onClick={() => handleCopy(offer.code)}
                    className="flex items-center gap-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors shadow-sm"
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-slate-400" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Valid until: {offer.validUntil}</span>
                  <Link
                    href={offer.actionLink}
                    className="font-bold text-sky-600 hover:underline inline-flex items-center gap-1"
                  >
                    <span>{offer.actionText} →</span>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
