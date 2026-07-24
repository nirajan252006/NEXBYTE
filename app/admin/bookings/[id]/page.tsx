"use client";

import React, { useEffect, useState, use } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Calendar, Clock, User, Phone, Mail, MapPin, Award, 
  ChevronRight, ArrowLeft, Send, CheckCircle, AlertCircle, 
  Trash2, Archive, Save, FileSpreadsheet, Paperclip 
} from "lucide-react";
import { dbHelper } from "@/lib/dbHelper";

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Status controls
  const [tech, setTech] = useState("");
  const [notes, setNotes] = useState("");
  const [reply, setReply] = useState("");

  const load = async () => {
    if (!id) return;
    try {
      const list = await dbHelper.bookings.list();
      const found = list.find((b) => b.id === id || b.bookingId === id);
      if (found) {
        setBooking(found);
        setTech(found.assignedTo || found.technician || "");
        setNotes(found.notes || "");
      }
    } catch {
      console.error("Failed to load booking details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener("nexbyte-realtime", handler);
    return () => window.removeEventListener("nexbyte-realtime", handler);
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-xs text-nex-mist">
        Loading booking details...
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="space-y-4 text-center py-20">
        <AlertCircle className="h-10 w-10 text-red-400 mx-auto" />
        <p className="text-xs text-nex-mist">Booking not found.</p>
        <button onClick={() => router.push("/admin/bookings")} className="btn-secondary !py-2 !px-4 text-xs">
          Back to Bookings
        </button>
      </div>
    );
  }

  const handleUpdateStatus = async (status: string) => {
    try {
      const now = new Date().toISOString();
      const timelineItem = {
        type: "status_change",
        status,
        timestamp: now,
        message: `Status updated to ${status}`
      };
      await dbHelper.bookings.update(booking.id, {
        status,
        timeline: [...(booking.timeline || []), timelineItem]
      });
      load();
      window.dispatchEvent(new CustomEvent("nexbyte-realtime"));
    } catch {
      alert("Failed to update status.");
    }
  };

  const handleSaveTechAndNotes = async () => {
    try {
      await dbHelper.bookings.update(booking.id, {
        assignedTo: tech,
        technician: tech,
        notes: notes
      });
      alert("Details saved successfully.");
      load();
      window.dispatchEvent(new CustomEvent("nexbyte-realtime"));
    } catch {
      alert("Failed to save changes.");
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;

    try {
      const now = new Date().toISOString();
      const chatItem = {
        type: "chat",
        sender: "admin",
        message: reply.trim(),
        timestamp: now
      };
      await dbHelper.bookings.update(booking.id, {
        replyMessage: reply.trim(),
        replyDate: now,
        replyBy: "NexByte Admin",
        timeline: [...(booking.timeline || []), chatItem]
      });
      setReply("");
      load();
      window.dispatchEvent(new CustomEvent("nexbyte-realtime"));
    } catch {
      alert("Failed to send message.");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this booking record?")) return;
    try {
      await dbHelper.bookings.delete(booking.id);
      window.dispatchEvent(new CustomEvent("nexbyte-realtime"));
      router.push("/admin/bookings");
    } catch {
      alert("Failed to delete booking.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.push("/admin/bookings")} className="btn-secondary !p-2">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            Booking Details: {booking.bookingId || booking.id}
          </h1>
          <p className="text-xs text-nex-mist mt-0.5">Manage assignments, status updates, and support chats.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns - Details & Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking Summary */}
          <div className="glass-card p-6 border-cyan-500/10 space-y-4">
            <h3 className="font-bold text-white text-sm border-b border-white/5 pb-2">Enquiry Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-nex-mist uppercase">Requested Item</span>
                <p className="text-white font-bold">{booking.productName || booking.service_name}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-nex-mist uppercase">Branch Office</span>
                <p className="text-white font-bold">{booking.branch || "Bengaluru (Head Office)"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-nex-mist uppercase">Preferred Date / Time</span>
                <p className="text-white">{booking.booking_date || "Anytime"} at {booking.booking_time || "Morning"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-nex-mist uppercase">Created Date</span>
                <p className="text-white">{new Date(booking.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            
            {booking.description && (
              <div className="pt-2 text-xs space-y-1">
                <span className="text-[10px] text-nex-mist uppercase">Problem Description</span>
                <p className="text-white bg-white/[0.01] border border-white/5 p-3 rounded-xl leading-relaxed">
                  {booking.description}
                </p>
              </div>
            )}
          </div>

          {/* Customer profile */}
          <div className="glass-card p-6 border-cyan-500/10 space-y-4">
            <h3 className="font-bold text-white text-sm border-b border-white/5 pb-2">Customer Profile</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-cyan-400" />
                <div>
                  <span className="text-[10px] text-nex-mist block uppercase">Name</span>
                  <span className="text-white font-semibold">{booking.customerName || booking.customer_name}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-cyan-400" />
                <div>
                  <span className="text-[10px] text-nex-mist block uppercase">Phone</span>
                  <span className="text-white font-semibold">{booking.phone}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-cyan-400" />
                <div>
                  <span className="text-[10px] text-nex-mist block uppercase">Email</span>
                  <span className="text-white font-semibold">{booking.email || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chat thread */}
          <div className="glass-card p-6 border-cyan-500/10 flex flex-col h-[400px]">
            <h3 className="font-bold text-white text-sm border-b border-white/5 pb-2 shrink-0">Live Service Chat Thread</h3>
            
            {/* Thread Container */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-2 scrollbar-thin">
              {!(booking.timeline || []).some((t: any) => t.type === "chat") ? (
                <div className="text-center py-10 text-[10px] text-nex-mist italic">
                  No conversation messages yet. Send a greeting to the customer.
                </div>
              ) : (
                (booking.timeline || [])
                  .filter((t: any) => t.type === "chat")
                  .map((msg: any, idx: number) => {
                    const isAdmin = msg.sender === "admin";
                    return (
                      <div key={idx} className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}>
                        <div className={`max-w-[75%] rounded-2xl p-3 text-xs ${
                          isAdmin 
                            ? "bg-cyan-600 text-white rounded-tr-none" 
                            : "bg-white/5 text-white/90 rounded-tl-none border border-white/10"
                        }`}>
                          <p className="leading-relaxed">{msg.message}</p>
                        </div>
                        <span className="text-[8px] text-nex-mist mt-1 block px-1">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
              )}
            </div>

            {/* Chat Send */}
            <form onSubmit={handleSendChat} className="mt-4 pt-3 border-t border-white/5 flex gap-2 shrink-0">
              <input
                type="text"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type your response to the customer..."
                className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
              />
              <button type="submit" className="btn-primary !p-2.5 bg-cyan-600 hover:bg-cyan-500 border-none shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column - Status & Actions */}
        <div className="space-y-6">
          {/* Status timeline & Flow */}
          <div className="glass-card p-6 border-cyan-500/10 space-y-4">
            <h3 className="font-bold text-white text-sm border-b border-white/5 pb-2">Status Timeline Flow</h3>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              {[
                "new", "assigned", "accepted", 
                "in_progress", "waiting", "completed", "cancelled"
              ].map((st) => (
                <button
                  key={st}
                  onClick={() => handleUpdateStatus(st)}
                  className={`py-2 px-3 rounded-xl border text-center font-bold capitalize transition-all ${
                    booking.status === st
                      ? "bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                      : "bg-white/[0.01] border-white/5 text-nex-mist hover:border-white/10"
                  }`}
                >
                  {st.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Assignments & Notes */}
          <div className="glass-card p-6 border-cyan-500/10 space-y-4">
            <h3 className="font-bold text-white text-sm border-b border-white/5 pb-2">Internal Administration</h3>
            
            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] text-nex-mist uppercase block">Assigned Technician</label>
                <input
                  type="text"
                  value={tech}
                  onChange={(e) => setTech(e.target.value)}
                  placeholder="e.g. Ramesh M"
                  className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-nex-mist uppercase block">Internal Admin Notes</label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tech diagnostics notes (visible only to admin)..."
                  className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-white resize-none"
                />
              </div>

              <button onClick={handleSaveTechAndNotes} className="w-full btn-primary !py-2 text-xs bg-cyan-600 hover:bg-cyan-500 border-none shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <Save className="h-4 w-4" /> Save Administration Details
              </button>
            </div>
          </div>

          {/* Delete action */}
          <div className="glass-card p-6 border-red-500/10 space-y-3">
            <h3 className="font-bold text-red-400 text-sm">Danger Zone</h3>
            <p className="text-[10px] text-nex-mist">Deletions are permanent and clear all associated customer timeline events.</p>
            <button onClick={handleDelete} className="w-full btn-secondary !py-2 text-xs text-red-400 border-red-500/20 hover:bg-red-500/10">
              <Trash2 className="h-4 w-4" /> Delete Booking Record
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
