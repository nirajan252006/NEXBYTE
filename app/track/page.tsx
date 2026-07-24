"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, Loader2, Calendar, ClipboardCheck, ArrowRight, ShieldCheck, CheckCircle2, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { dbHelper } from "@/lib/dbHelper";
import { safeJsonFetch } from "@/lib/apiHelper";

const STATUS_STEPS = ["pending", "approved", "contacted", "in_progress", "completed"];

export default function TrackPage() {
  const [searchVal, setSearchVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<{ bookings: any[]; enrollments: any[] }>({ bookings: [], enrollments: [] });
  const [chatReplies, setChatReplies] = useState<Record<string, string>>({});

  const handleSendCustomerChat = async (bookingId: string, text: string) => {
    if (!text.trim()) return;
    try {
      const target = results.bookings.find((b) => b.id === bookingId);
      if (!target) return;
      const now = new Date().toISOString();
      const chatItem = {
        type: "chat",
        sender: "customer",
        message: text.trim(),
        timestamp: now
      };
      await dbHelper.bookings.update(bookingId, {
        timeline: [...(target.timeline || []), chatItem]
      });
      setChatReplies((prev) => ({ ...prev, [bookingId]: "" }));
      // Trigger search reload
      const res = await safeJsonFetch(`/api/track?search=${encodeURIComponent(searchVal.trim())}`);
      if (res.ok && res.data?.success) {
        setResults(res.data.results);
      }
      window.dispatchEvent(new CustomEvent("nexbyte-realtime"));
    } catch {
      alert("Failed to send message.");
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchVal.trim()) return;

    setLoading(true);
    try {
      const res = await safeJsonFetch(`/api/track?search=${encodeURIComponent(searchVal.trim())}`);
      if (res.ok && res.data?.success) {
        setResults(res.data.results);
      } else {
        alert(res.error || "Search failed.");
      }
    } catch {
      alert("Error tracking request.");
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  // Listen to realtime events and trigger automatic reload if the user is currently viewing results
  useEffect(() => {
    const handleRealtime = () => {
      if (hasSearched && searchVal.trim()) {
        handleSearch();
      }
    };
    window.addEventListener("nexbyte-realtime", handleRealtime);
    return () => window.removeEventListener("nexbyte-realtime", handleRealtime);
  }, [hasSearched, searchVal]);

  const renderTimeline = (currentStatus: string) => {
    const activeIndex = STATUS_STEPS.indexOf(currentStatus.toLowerCase());
    return (
      <div className="mt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative">
        {/* Connection Line */}
        <div className="absolute left-4 top-4 bottom-4 w-0.5 md:left-6 md:right-6 md:top-1/2 md:h-0.5 md:w-auto bg-white/10 -z-10" />
        
        {STATUS_STEPS.map((step, idx) => {
          const isDone = idx <= activeIndex;
          const isCurrent = idx === activeIndex;

          return (
            <div key={step} className="flex md:flex-col items-center gap-3 md:gap-2 flex-1 z-10 w-full">
              <div 
                className={`h-8 w-8 md:h-12 md:w-12 rounded-full border flex items-center justify-center transition-all duration-500 ${
                  isDone 
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]" 
                    : "bg-nex-ink border-white/10 text-white/40"
                }`}
              >
                {isDone ? <CheckCircle2 className="h-4 w-4 md:h-6 md:w-6" /> : <span className="text-xs font-bold">{idx + 1}</span>}
              </div>
              <div className="text-left md:text-center">
                <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDone ? "text-cyan-400" : "text-white/40"}`}>
                  {step.replace("_", " ")}
                </span>
                {isCurrent && (
                  <span className="inline-block text-[8px] bg-cyan-400 text-black px-1.5 py-0.5 rounded font-black uppercase mt-1 animate-pulse">
                    Current Phase
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <Navbar />

      <main className="relative min-h-screen bg-aurora pt-28 pb-16 overflow-hidden">
        {/* Animated Background Overlay */}
        <div className="absolute inset-0 bg-grid-anim opacity-20 pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-4xl px-5 sm:px-8">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="section-eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-glow-blue" />
              Realtime Tracking Console
            </span>
            <h1 className="font-display text-3xl font-black tracking-tight text-white sm:text-5xl">
              Track My <span className="text-gradient-blue">Request.</span>
            </h1>
            <p className="mt-3 text-xs text-nex-mist leading-relaxed">
              Enter your Phone Number or Request ID (e.g. `NBT-2026-10021` or `NXB-000123`) to view repair logs, project abstracts approval, or admission status.
            </p>
          </div>

          {/* Search Box Card */}
          <div className="glass-rog p-6 border border-cyan-500/20 shadow-glow-blue max-w-2xl mx-auto mb-12">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-white/40" />
                <input
                  type="text"
                  required
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  placeholder="Enter Phone Number or Request ID..."
                  className="w-full rounded-2xl bg-white/[0.03] border border-white/10 pl-12 pr-4 py-3.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary !rounded-2xl !py-3.5 !px-8 text-xs bg-cyan-600 hover:bg-cyan-500 border-none shadow-[0_0_15px_rgba(6,182,212,0.3)] shrink-0"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify Status"}
              </button>
            </form>
          </div>

          {/* Results display */}
          <div className="space-y-8 max-w-3xl mx-auto">
            {loading && !hasSearched && (
              <div className="text-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mx-auto" />
                <p className="text-xs text-nex-mist mt-3">Connecting to database...</p>
              </div>
            )}

            {hasSearched && results.bookings.length === 0 && results.enrollments.length === 0 && (
              <div className="text-center py-16 glass-rog border-red-500/20 rounded-3xl p-8">
                <span className="text-3xl block mb-3">❌</span>
                <h3 className="font-display text-base font-bold text-white">No active records found</h3>
                <p className="text-xs text-nex-mist mt-1 max-w-sm mx-auto">
                  Double check the ID (must match exactly) or search by the primary Phone number used during booking.
                </p>
              </div>
            )}

            {hasSearched && (results.bookings.length > 0 || results.enrollments.length > 0) && (
              <div className="space-y-6">
                
                {/* Bookings Results */}
                {results.bookings.map((booking) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-rog p-6 border-cyan-500/20 shadow-glow-blue relative overflow-hidden"
                  >
                    <div className="absolute right-0 top-0 opacity-[0.02] pointer-events-none transform translate-x-4 -translate-y-4">
                      <Calendar size={120} />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4 gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-cyan-400 tracking-wider">Service Booking Portal</span>
                        <h3 className="font-display text-base font-bold text-white mt-0.5">{booking.productName}</h3>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-nex-mist uppercase block">Booking ID</span>
                        <span className="font-mono text-sm font-bold text-white">{booking.bookingId}</span>
                      </div>
                    </div>

                    {renderTimeline(booking.status)}

                    <div className="mt-8 border-t border-white/5 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[10px] text-nex-mist block uppercase">Technician Assigned</span>
                        <span className="font-medium text-white block mt-0.5">{booking.technician || "Assigning expert shortly"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-nex-mist block uppercase">Preferred Appointment Date</span>
                        <span className="font-medium text-white block mt-0.5">
                          {booking.preferredDate ? new Date(booking.preferredDate).toLocaleDateString("en-IN") : "Flexible Schedule"}
                        </span>
                      </div>
                    </div>

                    {/* Chat Panel */}
                    <div className="mt-6 border-t border-white/5 pt-5 space-y-4">
                      <span className="text-[10px] font-bold uppercase text-cyan-400 tracking-wider block">Live Chat Discussion</span>
                      
                      {/* Chat Messages */}
                      <div className="max-h-[220px] overflow-y-auto space-y-2.5 bg-white/[0.01] border border-white/5 rounded-2xl p-4 scrollbar-thin">
                        {!(booking.timeline || []).some((t: any) => t.type === "chat") ? (
                          <p className="text-center text-[10px] text-nex-mist italic py-6">
                            No messages in this chat yet. Send a message to start discussion.
                          </p>
                        ) : (
                          (booking.timeline || [])
                            .filter((t: any) => t.type === "chat")
                            .map((msg: any, idx: number) => {
                              const isSelf = msg.sender === "customer";
                              return (
                                <div key={idx} className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}>
                                  <div className={`max-w-[80%] rounded-xl p-2.5 text-xs ${
                                    isSelf 
                                      ? "bg-cyan-600 text-white rounded-tr-none" 
                                      : "bg-white/5 text-white/95 rounded-tl-none border border-white/10"
                                  }`}>
                                    <p>{msg.message}</p>
                                  </div>
                                  <span className="text-[8px] text-nex-mist mt-0.5 px-1 block">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              );
                            })
                        )}
                      </div>

                      {/* Reply Input Form */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={chatReplies[booking.id] || ""}
                          onChange={(e) => setChatReplies((prev) => ({ ...prev, [booking.id]: e.target.value }))}
                          placeholder="Type your message..."
                          className="flex-1 bg-white/[0.02] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                        />
                        <button
                          onClick={() => handleSendCustomerChat(booking.id, chatReplies[booking.id] || "")}
                          className="btn-primary !p-2 bg-cyan-600 hover:bg-cyan-500 border-none shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Enrollments Results */}
                {results.enrollments.map((enroll) => (
                  <motion.div
                    key={enroll.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-rog p-6 border-cyan-500/20 shadow-glow-blue relative overflow-hidden"
                  >
                    <div className="absolute right-0 top-0 opacity-[0.02] pointer-events-none transform translate-x-4 -translate-y-4">
                      <ClipboardCheck size={120} />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4 gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-cyan-400 tracking-wider">
                          {enroll.type === "internship" ? "Internship & Project Onboarding" : "Academy Training Session"}
                        </span>
                        <h3 className="font-display text-base font-bold text-white mt-0.5">
                          {enroll.courseTitle || enroll.projectType || "Technology Batch"}
                        </h3>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-nex-mist uppercase block">Enrollment ID</span>
                        <span className="font-mono text-sm font-bold text-white">{enroll.enrollmentId}</span>
                      </div>
                    </div>

                    {renderTimeline(enroll.status)}

                    <div className="mt-8 border-t border-white/5 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[10px] text-nex-mist block uppercase">Student Name</span>
                        <span className="font-medium text-white block mt-0.5">{enroll.fullName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-nex-mist block uppercase">Registered Branch / College</span>
                        <span className="font-medium text-white block mt-0.5">{enroll.branch} @ {enroll.college}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}

              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
