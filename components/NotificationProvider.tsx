"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  Calendar, 
  Star, 
  Mail, 
  GraduationCap, 
  BookOpen, 
  ShoppingBag, 
  Wrench, 
  Users, 
  X,
  Laptop
} from "lucide-react";
import { realtimeSync } from "@/lib/realtimeSync";
import { useNotificationStore } from "@/lib/notificationStore";

interface Toast {
  id: string;
  title: string;
  message: string;
  type: string;
}

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
  booking: { 
    icon: <Calendar className="h-5 w-5 text-nex-blueLight" />, 
    color: "border-nex-blue/30 text-nex-blueLight shadow-[0_0_15px_rgba(74,140,255,0.15)]", 
    bgColor: "bg-nex-blue/10" 
  },
  review: { 
    icon: <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />, 
    color: "border-yellow-500/30 text-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.15)]", 
    bgColor: "bg-yellow-500/10" 
  },
  contact: { 
    icon: <Mail className="h-5 w-5 text-green-400" />, 
    color: "border-green-500/30 text-green-400 shadow-[0_0_15px_rgba(74,222,128,0.15)]", 
    bgColor: "bg-green-500/10" 
  },
  laptop_enquiry: { 
    icon: <Laptop className="h-5 w-5 text-purple-400" />, 
    color: "border-purple-500/30 text-purple-400 shadow-[0_0_15px_rgba(192,132,252,0.15)]", 
    bgColor: "bg-purple-500/10" 
  },
  internship: { 
    icon: <GraduationCap className="h-5 w-5 text-amber-400" />, 
    color: "border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.15)]", 
    bgColor: "bg-amber-500/10" 
  },
  training: { 
    icon: <BookOpen className="h-5 w-5 text-cyan-400" />, 
    color: "border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.15)]", 
    bgColor: "bg-cyan-500/10" 
  },
  product: { 
    icon: <ShoppingBag className="h-5 w-5 text-indigo-400" />, 
    color: "border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.15)]", 
    bgColor: "bg-indigo-500/10" 
  },
  service: { 
    icon: <Wrench className="h-5 w-5 text-teal-400" />, 
    color: "border-teal-500/30 text-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.15)]", 
    bgColor: "bg-teal-500/10" 
  },
  customer: { 
    icon: <Users className="h-5 w-5 text-emerald-400" />, 
    color: "border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.15)]", 
    bgColor: "bg-emerald-500/10" 
  },
  default: { 
    icon: <Bell className="h-5 w-5 text-nex-blueLight" />, 
    color: "border-nex-blue/30 text-nex-blueLight shadow-[0_0_15px_rgba(74,140,255,0.15)]", 
    bgColor: "bg-nex-blue/10" 
  },
};

const NotificationContext = createContext<any>(null);

export default function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const addNotification = useNotificationStore((s) => s.addNotification);

  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Chime 1 (Lower)
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      gain1.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);
      osc1.start();
      osc1.stop(audioCtx.currentTime + 0.3);

      // Chime 2 (Higher, offset slightly)
      setTimeout(() => {
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        gain2.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.4);
        osc2.start();
        osc2.stop(audioCtx.currentTime + 0.4);
      }, 100);
    } catch (e) {
      console.warn("AudioContext failed to initialize (browser gesture block):", e);
    }
  };

  const showToast = (title: string, message: string, type: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  useEffect(() => {
    // Initial fetch of unread/recent list
    fetchNotifications();

    // Init realtime sync singleton
    realtimeSync.init();

    const handleRealtimeEvent = (e: any) => {
      const { table, eventType, new: newRecord } = e.detail || {};
      
      if (eventType === "INSERT") {
        let title = "New Update Received";
        let message = `A new entry was added to ${table}.`;
        let toastType = "default";

        // Map tables to specific messaging
        if (table === "bookings") {
          title = "New Booking Received 📅";
          message = `${newRecord.customerName || newRecord.customer_name || "A customer"} booked ${newRecord.productName || newRecord.service_name || "a request"}`;
          toastType = "booking";
        } else if (table === "contacts") {
          title = "New Contact Enquiry ✉️";
          message = `${newRecord.name} sent a message: ${newRecord.subject || ""}`;
          toastType = "contact";
        } else if (table === "laptop_enquiries") {
          title = "New Laptop Enquiry 💻";
          message = `${newRecord.customer_name} is looking for ${newRecord.laptop_type || "laptop"}`;
          toastType = "laptop_enquiry";
        } else if (table === "reviews") {
          title = "New Review Submitted ⭐";
          message = `${newRecord.customer_name || "A customer"} rated us ${newRecord.rating} Stars`;
          toastType = "review";
        } else if (table === "internships") {
          title = "New Internship Application 🎓";
          message = `${newRecord.student_name} applied for ${newRecord.domain}`;
          toastType = "internship";
        } else if (table === "training") {
          title = "New Training Enrollment 📚";
          message = `${newRecord.student_name} registered for ${newRecord.course_title}`;
          toastType = "training";
        } else if (table === "products") {
          title = "Catalog Updated 🛍️";
          message = `Product "${newRecord.name}" has been added.`;
          toastType = "product";
        } else if (table === "services") {
          title = "Service Offered 🔧";
          message = `Service "${newRecord.name}" has been added.`;
          toastType = "service";
        } else if (table === "users") {
          title = "New Customer Registered 👥";
          message = `${newRecord.full_name || newRecord.email} created an account.`;
          toastType = "customer";
        } else if (table === "notifications") {
          // If the notification table itself got an insert, we add it to our store
          addNotification(newRecord);
          // Return so we don't duplicate notifications
          return;
        }

        // Show toast notification
        showToast(title, message, toastType);
        
        // Play audio chime
        playNotificationSound();

        // Refresh Zustand store list and count
        fetchNotifications();
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("nexbyte-realtime", handleRealtimeEvent);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("nexbyte-realtime", handleRealtimeEvent);
      }
    };
  }, [fetchNotifications, addNotification]);

  return (
    <NotificationContext.Provider value={{ showToast, playNotificationSound }}>
      {children}

      {/* Floating Glassmorphic Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const cfg = TYPE_CONFIG[toast.type] || TYPE_CONFIG.default;
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl glass-panel bg-nex-ink/95 border border-white/10 shadow-glow-blue max-w-full`}
              >
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border ${cfg.color} ${cfg.bgColor}`}>
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white text-xs">{toast.title}</h4>
                  <p className="text-[11px] text-nex-mist mt-0.5 leading-relaxed">{toast.message}</p>
                  {toast.type === "booking" && (
                    <div className="mt-2 flex items-center gap-2">
                      <Link
                        href="/admin/bookings"
                        onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                        className="inline-flex items-center gap-1 rounded-lg bg-nex-blue px-2.5 py-1 text-[10px] font-bold text-white shadow-sm hover:bg-nex-blueLight transition-colors"
                      >
                        Open Booking
                      </Link>
                      <Link
                        href="/admin/bookings"
                        onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                        className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-white/20 transition-colors"
                      >
                        Assign
                      </Link>
                    </div>
                  )}
                  {toast.type === "review" && (
                    <div className="mt-2 flex items-center gap-2">
                      <Link
                        href="/admin/reviews"
                        onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                        className="inline-flex items-center gap-1 rounded-lg bg-nex-blue px-2.5 py-1 text-[10px] font-bold text-white shadow-sm hover:bg-nex-blueLight transition-colors"
                      >
                        Review Now
                      </Link>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                  className="text-white/40 hover:text-white shrink-0 self-start transition-colors p-0.5 rounded-lg hover:bg-white/5"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}

export const useNotification = () => useContext(NotificationContext);
