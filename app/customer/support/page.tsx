"use client";

import Link from "next/link";
import { Phone, MessageSquare, Mail, HelpCircle, Bot, MapPin, ExternalLink, ShieldCheck } from "lucide-react";
import FAQ from "@/components/FAQ";

export default function CustomerSupportPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-[#E6EAF0] dark:border-white/10 p-6 sm:p-8 shadow-sm space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 px-3 py-1 text-xs font-bold text-sky-700 dark:text-sky-300">
          <HelpCircle className="h-3.5 w-3.5 text-sky-600" /> NexByte Customer Care
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Help &amp; Customer Support
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
          Need assistance with a repair booking, hardware order, or technical inquiry? Reach our expert computer technicians directly.
        </p>
      </div>

      {/* Contact Channels Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Call */}
        <a
          href="tel:+919876543210"
          className="rounded-2xl border border-[#E6EAF0] dark:border-white/10 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-all space-y-3 block"
        >
          <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 w-fit">
            <Phone className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">Call NexByte</h3>
            <p className="text-xs text-slate-500 mt-0.5">Speak with a technician</p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-600">
            <span>Call Now</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </span>
        </a>

        {/* WhatsApp */}
        <a
          href="https://wa.me/919876543210"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-2xl border border-[#E6EAF0] dark:border-white/10 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-all space-y-3 block"
        >
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 w-fit">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">WhatsApp Support</h3>
            <p className="text-xs text-slate-500 mt-0.5">Instant message &amp; photos</p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
            <span>Open WhatsApp</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </span>
        </a>

        {/* Contact Form */}
        <Link
          href="/contact"
          className="rounded-2xl border border-[#E6EAF0] dark:border-white/10 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-all space-y-3 block"
        >
          <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 w-fit">
            <Mail className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">Email Enquiry</h3>
            <p className="text-xs text-slate-500 mt-0.5">Official support ticket</p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-600">
            <span>Send Message</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </span>
        </Link>

        {/* Ask AI */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("nexbyte-open-ai-chat"))}
          className="rounded-2xl border border-[#E6EAF0] dark:border-white/10 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-all space-y-3 text-left w-full"
        >
          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 w-fit">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">Ask NexByte AI</h3>
            <p className="text-xs text-slate-500 mt-0.5">24/7 AI diagnostic assistant</p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600">
            <span>Launch AI Chat</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </span>
        </button>
      </div>

      {/* Service Coverage Information (NO physical address string per req #29) */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-[#E6EAF0] dark:border-white/10 p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-sky-600 font-bold text-sm">
          <MapPin className="h-4.5 w-4.5" />
          <span>Regional Service Coverage</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          NexByte Technologies provides doorstep repair, CCTV installation, and computer delivery services across:
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="rounded-xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 px-3.5 py-1.5 text-xs font-bold text-sky-700 dark:text-sky-300">
            📍 Bengaluru Region
          </span>
          <span className="rounded-xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 px-3.5 py-1.5 text-xs font-bold text-sky-700 dark:text-sky-300">
            📍 Tumkur Region
          </span>
          <span className="rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-3.5 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
            ⏳ Hiriyur — Coming Soon
          </span>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-[#E6EAF0] dark:border-white/10 p-6 shadow-sm">
        <FAQ />
      </div>
    </div>
  );
}
