"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  Calendar,
  ShoppingBag,
  Award,
  Heart,
  Bell,
  LogOut,
  Home,
  ChevronRight,
  Shield,
  LifeBuoy,
  ClipboardList,
  Download,
  PlusCircle,
  FileCheck,
  MessageSquare,
  Star,
  Edit,
  Send,
} from "lucide-react";
import { dbHelper } from "@/lib/dbHelper";
import { products } from "@/lib/data";

type Tab = "overview" | "bookings" | "orders" | "certificates" | "reviews" | "wishlist" | "notifications" | "profile" | "support";

export default function CustomerDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  
  // Client state
  const [userName, setUserName] = useState("Ramesh Kumar");
  const [userEmail, setUserEmail] = useState("customer@nexbyte.com");
  const [userPhone, setUserPhone] = useState("9876543210");
  const [userId, setUserId] = useState("cust-1");

  const [bookings, setBookings] = useState<any[]>([]);
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [internships, setInternships] = useState<any[]>([]);
  const [training, setTraining] = useState<any[]>([]);

  // Edit Review Modal / Form State
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editMsg, setEditMsg] = useState("");
  const [resubmitting, setResubmitting] = useState(false);

  // Profile Edit fields
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  // Support Ticket Form
  const [tickets, setTickets] = useState<any[]>([
    { id: "tk-1", subject: "RAM Upgrade Inquiry", status: "closed", reply: "Yes, we can upgrade it to 16GB. Please visit the branch.", created_at: "2026-07-16" }
  ]);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMsg, setTicketMsg] = useState("");
  const [ticketSuccess, setTicketSuccess] = useState(false);

  // Load cookies and session on mount
  useEffect(() => {
    // Read customer session cookie values
    const cookies = document.cookie.split(";").reduce((acc: any, cookie) => {
      const [key, val] = cookie.trim().split("=");
      acc[key] = val;
      return acc;
    }, {});

    const sessionUser = cookies["nexbyte_customer_session"];
    const sessionEmail = cookies["nexbyte_customer_email"] ? decodeURIComponent(cookies["nexbyte_customer_email"]) : "";
    const sessionName = cookies["nexbyte_customer_name"] ? decodeURIComponent(cookies["nexbyte_customer_name"]) : "";

    if (sessionUser) {
      setUserId(sessionUser);
      if (sessionEmail) setUserEmail(sessionEmail);
      if (sessionName) {
        setUserName(sessionName);
        setEditName(sessionName);
      }
    } else {
      router.replace("/customer/login");
      return;
    }

    // Load dynamic data
    const loadData = async () => {
      const allBookings = await dbHelper.bookings.list();
      setBookings(allBookings.filter((b) => b.customer_id === sessionUser || b.email === sessionEmail));

      const allReviews = await dbHelper.reviews.list();
      setUserReviews(allReviews.filter((r) => r.email === sessionEmail || r.customer_name === sessionName));

      const allInterns = await dbHelper.internships.list();
      setInternships(allInterns.filter((i) => i.email === sessionEmail));

      const allTrainings = await dbHelper.training.list();
      setTraining(allTrainings.filter((t) => t.email === sessionEmail));

      const allNotif = await dbHelper.notifications.list();
      setNotifications(allNotif.slice(0, 5));

      try {
        const saved = localStorage.getItem("nexbyte_wishlist");
        if (saved) setWishlistIds(JSON.parse(saved));
      } catch (e) {}
    };

    loadData();

    const handleRealtime = () => loadData();
    window.addEventListener("nexbyte-realtime", handleRealtime);
    return () => {
      window.removeEventListener("nexbyte-realtime", handleRealtime);
    };
  }, [router]);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/customer/logout", { method: "POST" });
      if (res.ok) {
        router.replace("/customer/login");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName) return;
    setUserName(editName);
    setUserPhone(editPhone);
    document.cookie = `nexbyte_customer_name=${encodeURIComponent(editName)}; path=/`;
    alert("Profile workspace updated successfully.");
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMsg) return;

    const newTicket = {
      id: `tk-${Date.now()}`,
      subject: ticketSubject,
      status: "open",
      reply: "Pending response from support desk.",
      created_at: new Date().toISOString().split("T")[0]
    };

    setTickets([newTicket, ...tickets]);
    setTicketSubject("");
    setTicketMsg("");
    setTicketSuccess(true);
    setTimeout(() => setTicketSuccess(false), 2000);
  };

  const handleDownloadInvoice = (booking: any) => {
    const text = `NEXBYTE TECHNOLOGIES - SERVICE INVOICE
========================================
Receipt ID: ${booking.id}
Date: ${booking.booking_date}
Time Slot: ${booking.booking_time}

CLIENT DETAILS:
- Name: ${booking.customer_name}
- Phone: ${booking.phone}
- Email: ${booking.email || "N/A"}

SERVICE BOOKED:
- Service: ${booking.service_name}
- Status: ${booking.status.toUpperCase()}

NOTES / NOTES:
${booking.notes || "None"}

Thank you for choosing NexByte Technologies!
For immediate assistance, call 8088979706.`;

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Invoice_${booking.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCertificate = (train: any) => {
    const text = `NEXBYTE ACADEMY CERTIFICATION
=========================================
Registration ID: NB-CERT-${train.id}
Course: ${train.course_title}

This is to certify that:
${train.student_name}

has successfully completed the practical Desktop Repair & Systems Engineering Course
conducted by NexByte Technologies.

Issued Date: ${new Date().toLocaleDateString("en-IN")}
Lead Instructor: ${train.trainer || "Niranjan M."}
Status: VERIFIED`;

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Certificate_${train.student_name.replace(" ", "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen bg-nex-black text-white">
      {/* Sidebar navigation */}
      <aside className="w-64 border-r border-white/10 bg-nex-ink flex flex-col justify-between shrink-0 hidden md:flex">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 mb-8 group">
            <div className="relative h-9 w-9">
              <div className="absolute inset-0 rounded-full bg-nex-blue/30 blur-md group-hover:bg-nex-blue/50 transition-colors" />
              <Image
                src="/images/logo-icon-transparent.png"
                alt="NexByte logo"
                fill
                sizes="36px"
                className="relative object-contain"
              />
            </div>
            <span className="font-display text-base font-bold tracking-tight text-white">
              NEX<span className="text-nex-blueLight">BYTE</span> Portal
            </span>
          </Link>

          <nav className="space-y-1">
            {[
              { id: "overview", label: "Dashboard Home", icon: Shield },
              { id: "bookings", label: "Bookings History", icon: Calendar },
              { id: "orders", label: "Purchases", icon: ShoppingBag },
              { id: "certificates", label: "Certifications", icon: Award },
              { id: "reviews", label: "My Reviews", icon: Star },
              { id: "wishlist", label: "My Wishlist", icon: Heart },
              { id: "notifications", label: "Notifications", icon: Bell },
              { id: "profile", label: "Profile Details", icon: User },
              { id: "support", label: "Support Tickets", icon: LifeBuoy },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as Tab)}
                  className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold tracking-wide transition-all border ${
                    isSelected
                      ? "bg-nex-blue/15 border-nex-blue/30 text-nex-blueLight"
                      : "text-white/60 border-transparent hover:text-white hover:bg-white/[0.03]"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6 border-t border-white/5 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold text-white/60 hover:text-white hover:bg-white/[0.03] transition-colors"
          >
            <Home className="h-4.5 w-4.5" />
            Return to Store
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
          >
            <LogOut className="h-4.5 w-4.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Content wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Mobile Header navigation */}
        <header className="h-16 border-b border-white/10 bg-nex-ink px-6 flex items-center justify-between md:hidden">
          <div className="flex items-center gap-2">
            <Image src="/images/logo-icon-transparent.png" alt="logo" width={28} height={28} />
            <span className="font-display text-sm font-bold text-white">NexByte Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as Tab)}
              className="rounded bg-nex-black border border-white/10 text-xs px-2 py-1 text-white focus:outline-none"
            >
              <option value="overview">Home</option>
              <option value="bookings">Bookings</option>
              <option value="orders">Orders</option>
              <option value="certificates">Certificates</option>
              <option value="wishlist">Wishlist</option>
              <option value="notifications">Alerts</option>
              <option value="profile">Profile</option>
              <option value="support">Support</option>
            </select>
            <button onClick={handleLogout} className="text-xs text-red-400 font-bold">Logout</button>
          </div>
        </header>

        {/* Dynamic Inner Panel Viewport */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          
          {/* Tab: Overview */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              <div>
                <h1 className="font-display text-2xl font-bold text-white">Welcome back, {userName}!</h1>
                <p className="text-xs text-nex-mist mt-1">Manage active support services, certificates, and bookings from your private dashboard.</p>
              </div>

              {/* Statistics counters */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="glass-panel p-5 rounded-2xl bg-nex-ink border border-white/5">
                  <span className="text-[10px] text-nex-mist font-semibold uppercase tracking-wider block">Total Bookings</span>
                  <span className="font-display text-2xl font-bold text-white mt-1 block">{bookings.length}</span>
                </div>
                <div className="glass-panel p-5 rounded-2xl bg-nex-ink border border-white/5">
                  <span className="text-[10px] text-nex-mist font-semibold uppercase tracking-wider block">Pending Bookings</span>
                  <span className="font-display text-2xl font-bold text-nex-blueLight mt-1 block">
                    {bookings.filter((b) => b.status === "pending").length}
                  </span>
                </div>
                <div className="glass-panel p-5 rounded-2xl bg-nex-ink border border-white/5">
                  <span className="text-[10px] text-nex-mist font-semibold uppercase tracking-wider block">Active Internships</span>
                  <span className="font-display text-2xl font-bold text-white mt-1 block">{internships.length}</span>
                </div>
                <div className="glass-panel p-5 rounded-2xl bg-nex-ink border border-white/5">
                  <span className="text-[10px] text-nex-mist font-semibold uppercase tracking-wider block">Certificates Earned</span>
                  <span className="font-display text-2xl font-bold text-green-400 mt-1 block">{training.length}</span>
                </div>
              </div>

              {/* Quick Status Check */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Bookings alert */}
                <div className="glass-panel p-6 rounded-2xl bg-nex-ink border border-white/5">
                  <h3 className="font-display text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Calendar className="h-4.5 w-4.5 text-nex-blueLight" /> Latest Active Booking Status
                  </h3>
                  {bookings.length === 0 ? (
                    <p className="text-xs text-nex-mist py-4">No service bookings submitted yet.</p>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-white/90 truncate max-w-[200px]">{bookings[0].service_name}</span>
                        <span className="rounded bg-white/5 px-2 py-0.5 font-bold uppercase tracking-wider text-[9px]">
                          {bookings[0].status}
                        </span>
                      </div>
                      
                      {/* Flow bar */}
                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between text-[10px]">
                          <div><span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-nex-blueLight bg-nex-blue/10">Progress status flow</span></div>
                          <div className="text-right"><span className="text-xs font-semibold inline-block text-nex-blueLight">100% Secure</span></div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-white/5">
                          <div
                            style={{
                              width:
                                bookings[0].status === "pending"
                                  ? "25%"
                                  : bookings[0].status === "confirmed"
                                  ? "50%"
                                  : bookings[0].status === "in_progress"
                                  ? "75%"
                                  : bookings[0].status === "completed"
                                  ? "100%"
                                  : "0%"
                            }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-nex-blue"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Academic enrollments alert */}
                <div className="glass-panel p-6 rounded-2xl bg-nex-ink border border-white/5">
                  <h3 className="font-display text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Award className="h-4.5 w-4.5 text-nex-blueLight" /> Academic Academy Records
                  </h3>
                  {internships.length === 0 && training.length === 0 ? (
                    <p className="text-xs text-nex-mist py-4">No academy training or project enrollments found.</p>
                  ) : (
                    <div className="space-y-3 text-xs">
                      {internships.map((i) => (
                        <div key={i.id} className="flex justify-between items-center border-b border-white/5 pb-2">
                          <span className="text-nex-mist">Internship Project domain ({i.domain})</span>
                          <span className="font-bold text-white uppercase text-[10px]">{i.status}</span>
                        </div>
                      ))}
                      {training.map((t) => (
                        <div key={t.id} className="flex justify-between items-center border-b border-white/5 pb-2">
                          <span className="text-nex-mist">Course: {t.course_title}</span>
                          <button
                            onClick={() => handleDownloadCertificate(t)}
                            className="text-nex-blueLight hover:underline font-bold flex items-center gap-1 text-[10px]"
                          >
                            <Download className="h-3 w-3" /> Get Certificate
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Bookings */}
          {activeTab === "bookings" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="font-display text-xl font-bold text-white">Bookings & Service Trackers</h1>
                  <p className="text-xs text-nex-mist mt-0.5">List of all scheduled computer services and structural diagnostics.</p>
                </div>
                <Link href="/book-service" className="btn-primary !py-2 !px-4 text-xs flex items-center gap-1.5">
                  <PlusCircle className="h-4 w-4" /> Book Service
                </Link>
              </div>

              {bookings.length === 0 ? (
                <div className="text-center py-16 glass-panel rounded-2xl">
                  <Calendar className="h-10 w-10 text-nex-mist mx-auto mb-3" />
                  <p className="text-xs text-white">You have no bookings recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((b) => (
                    <div key={b.id} className="glass-card p-6 bg-nex-ink border border-white/5 rounded-2xl space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/5 pb-3">
                        <div>
                          <span className="font-mono text-xs font-bold text-nex-blueLight">{b.bookingId || b.id}</span>
                          <span className="text-[10px] text-nex-mist ml-3">
                            {b.booking_date || b.createdAt ? new Date(b.booking_date || b.createdAt).toLocaleDateString("en-IN") : ""} @ {b.booking_time || b.preferredTime || "10:30 AM"}
                          </span>
                        </div>
                        <span
                          className={`text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full border self-start sm:self-auto ${
                            b.status === "submitted" || b.status === "new"
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                              : b.status === "approved" || b.status === "confirmed"
                              ? "bg-green-500/10 text-green-400 border-green-500/20"
                              : b.status === "completed" || b.status === "delivered"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : b.status === "need_info"
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}
                        >
                          {b.status.replace("_", " ")}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-[10px] text-nex-mist font-semibold uppercase">Product / Service</p>
                          <p className="font-bold text-white mt-0.5">{b.productName || b.service_name}</p>
                          {b.configuration && (
                            <p className="text-[10px] text-nex-mist mt-0.5">Config: {b.configuration}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-[10px] text-nex-mist font-semibold uppercase">Assigned Engineer</p>
                          <p className="font-bold text-white mt-0.5">
                            {b.assignedTo || b.technician || <span className="text-amber-400/80 font-normal italic">Assigning soon...</span>}
                          </p>
                        </div>
                      </div>

                      {/* Admin Message / Reply */}
                      {b.replyMessage && (
                        <div className="rounded-xl border border-nex-blue/20 bg-nex-blue/5 p-3 text-xs text-white/90">
                          <p className="font-semibold text-nex-blueLight">Message from NexByte Admin:</p>
                          <p className="mt-1">{b.replyMessage}</p>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
                        <div className="text-[10px] text-nex-mist">
                          Qty: {b.quantity || 1} · Contact: {b.preferredContact || "WhatsApp"}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              window.dispatchEvent(new CustomEvent("nexbyte-open-booking-modal", {
                                detail: {
                                  tab: "track",
                                  bookingId: b.bookingId || b.id,
                                  phone: b.phone
                                }
                              }));
                            }}
                            className="btn-primary !py-1.5 !px-3 text-[10px] flex items-center gap-1 cursor-pointer"
                          >
                            <MessageSquare className="h-3.5 w-3.5" /> Track &amp; Live Chat
                          </button>
                          <button
                            onClick={() => handleDownloadInvoice(b)}
                            className="btn-secondary !py-1.5 !px-3 text-[10px] flex items-center gap-1 cursor-pointer"
                          >
                            <Download className="h-3.5 w-3.5" /> Download Invoice
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Orders */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-xl font-bold text-white">Purchased Products</h1>
                <p className="text-xs text-nex-mist mt-0.5">Records of custom-built desktop towers, second-hand laptops, and hardware upgrade packages.</p>
              </div>

              <div className="text-center py-16 glass-panel rounded-2xl">
                <ShoppingBag className="h-10 w-10 text-nex-mist mx-auto mb-3" />
                <p className="text-xs text-white">You have no product purchase transactions recorded yet.</p>
                <Link href="/products" className="text-nex-blueLight text-xs underline mt-2 inline-block">
                  Browse products catalog
                </Link>
              </div>
            </div>
          )}

          {/* Tab: Certificates */}
          {activeTab === "certificates" && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-xl font-bold text-white">Academy Certifications</h1>
                <p className="text-xs text-nex-mist mt-0.5">Download your verified engineering, IoT, and systems servicing certificates.</p>
              </div>

              {training.filter((t) => t.attendance_status === "present").length === 0 ? (
                <div className="text-center py-16 glass-panel rounded-2xl">
                  <Award className="h-10 w-10 text-nex-mist mx-auto mb-3" />
                  <p className="text-xs text-white">No academic certificates issued yet. Complete a training course to unlock.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {training.map((t) => (
                    <div key={t.id} className="glass-card p-5 bg-nex-ink border border-white/5 rounded-2xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-nex-blueLight uppercase">{t.batch}</span>
                        <h3 className="font-display text-sm font-bold text-white mt-1">{t.course_title}</h3>
                        <p className="text-[10px] text-nex-mist mt-0.5">Trainer: {t.trainer || "Niranjan M."}</p>
                      </div>
                      <button
                        onClick={() => handleDownloadCertificate(t)}
                        className="btn-primary !py-2 !px-4 text-[10px] flex items-center gap-1.5"
                      >
                        <Download className="h-3.5 w-3.5" /> Download Certificate (TXT)
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: My Reviews */}
          {activeTab === "reviews" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="font-display text-xl font-bold text-white">My Feedback &amp; Reviews</h1>
                  <p className="text-xs text-nex-mist mt-0.5">Track moderation status, admin replies, and update requested reviews.</p>
                </div>
                <button
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent("nexbyte-open-booking-modal", { detail: { type: "service" } }));
                  }}
                  className="btn-primary !py-2 !px-4 text-xs shrink-0 self-start sm:self-auto flex items-center gap-1.5"
                >
                  <Star className="h-3.5 w-3.5" /> Leave New Review
                </button>
              </div>

              {userReviews.length === 0 ? (
                <div className="text-center py-16 glass-panel rounded-2xl">
                  <Star className="h-10 w-10 text-nex-mist mx-auto mb-3" />
                  <p className="text-xs text-white">You haven&apos;t submitted any reviews yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userReviews.map((rev) => (
                    <div key={rev.id} className="glass-card p-5 bg-nex-ink border border-white/5 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex text-amber-400 text-xs">
                            {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                          </span>
                          <span className="text-[10px] text-nex-mist">
                            {rev.created_at ? new Date(rev.created_at).toLocaleDateString("en-IN") : ""}
                          </span>
                        </div>
                        <span
                          className={`text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                            rev.status === "pending"
                              ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                              : rev.status === "approved"
                              ? "bg-green-500/10 text-green-400 border-green-500/20"
                              : rev.status === "need_modification"
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                              : "bg-red-500/10 text-red-400 border-red-500/20"
                          }`}
                        >
                          {rev.status === "need_modification" ? "Modification Requested" : rev.status}
                        </span>
                      </div>

                      {/* Service / Product Category */}
                      {(rev.service_used || rev.product_purchased) && (
                        <p className="text-[11px] font-semibold text-nex-blueLight">
                          {rev.service_used ? `Service: ${rev.service_used}` : `Product: ${rev.product_purchased}`}
                        </p>
                      )}

                      {/* Review Message Body */}
                      <p className="text-xs text-white/90 leading-relaxed bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl">
                        {rev.review_message}
                      </p>

                      {/* Rejection / Modification Reason Callouts */}
                      {rev.rejection_reason && (
                        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                          <strong className="font-bold">Admin Rejection Note:</strong> {rev.rejection_reason}
                        </div>
                      )}

                      {rev.modification_reason && (
                        <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-3 text-xs text-purple-300 space-y-2">
                          <div>
                            <strong className="font-bold">Admin Request:</strong> {rev.modification_reason}
                          </div>
                          <button
                            onClick={() => {
                              setEditingReviewId(rev.id);
                              setEditRating(rev.rating);
                              setEditMsg(rev.review_message);
                            }}
                            className="btn-primary !bg-purple-600 hover:!bg-purple-700 !py-1.5 !px-3 text-[10px] flex items-center gap-1"
                          >
                            <Edit className="h-3 w-3" /> Update &amp; Resubmit Review
                          </button>
                        </div>
                      )}

                      {/* Admin Reply */}
                      {rev.admin_reply && (
                        <div className="rounded-xl border border-nex-blue/20 bg-nex-blue/5 p-3 text-xs text-white/90">
                          <p className="font-semibold text-nex-blueLight">Response from NexByte Team:</p>
                          <p className="mt-1">{rev.admin_reply}</p>
                        </div>
                      )}

                      {/* Inline Edit & Resubmit Form */}
                      {editingReviewId === rev.id && (
                        <div className="mt-3 pt-3 border-t border-white/10 space-y-3">
                          <h4 className="text-xs font-bold text-white">Edit Your Review:</h4>
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-nex-mist font-medium">Rating:</label>
                            <select
                              value={editRating}
                              onChange={(e) => setEditRating(Number(e.target.value))}
                              className="rounded bg-nex-black border border-white/10 text-xs px-2 py-1 text-white"
                            >
                              <option value={5}>5 Stars ★★★★★</option>
                              <option value={4}>4 Stars ★★★★☆</option>
                              <option value={3}>3 Stars ★★★☆☆</option>
                              <option value={2}>2 Stars ★★☆☆☆</option>
                              <option value={1}>1 Star ★☆☆☆☆</option>
                            </select>
                          </div>
                          <textarea
                            value={editMsg}
                            onChange={(e) => setEditMsg(e.target.value)}
                            rows={3}
                            className="w-full rounded-xl bg-nex-black border border-white/10 p-3 text-xs text-white focus:outline-none"
                          />
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => setEditingReviewId(null)} className="btn-secondary !py-1.5 !px-3 text-xs">
                              Cancel
                            </button>
                            <button
                              disabled={resubmitting}
                              onClick={async () => {
                                setResubmitting(true);
                                try {
                                  await dbHelper.reviews.update(rev.id, {
                                    rating: editRating,
                                    review_message: editMsg,
                                    status: "pending",
                                    modification_reason: null,
                                  });
                                  setEditingReviewId(null);
                                  const allReviews = await dbHelper.reviews.list();
                                  setUserReviews(allReviews.filter((r) => r.email === userEmail || r.customer_name === userName));
                                } catch (e) {
                                  console.error(e);
                                } finally {
                                  setResubmitting(false);
                                }
                              }}
                              className="btn-primary !py-1.5 !px-3 text-xs flex items-center gap-1"
                            >
                              <Send className="h-3 w-3" /> Resubmit to Admin
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Wishlist */}
          {activeTab === "wishlist" && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-xl font-bold text-white">My Wishlisted Items</h1>
                <p className="text-xs text-nex-mist mt-0.5 font-medium">Laptops, custom towers, and components you saved for comparison.</p>
              </div>

              {wishlistIds.length === 0 ? (
                <div className="text-center py-16 glass-panel rounded-2xl">
                  <Heart className="h-10 w-10 text-nex-mist mx-auto mb-3" />
                  <p className="text-xs text-white">Your wishlist folder is empty.</p>
                  <Link href="/products" className="text-nex-blueLight text-xs underline mt-2 inline-block">
                    Explore catalog
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {products.filter((p) => wishlistIds.includes(p.id)).map((p) => (
                    <div key={p.id} className="glass-card p-5 bg-nex-ink border border-white/5 rounded-2xl flex flex-col justify-between">
                      <div>
                        <h4 className="font-display text-sm font-bold text-white">{p.title}</h4>
                        <p className="text-[10px] text-nex-mist mt-1 line-clamp-2">{p.description}</p>
                        <p className="text-xs font-semibold text-white/95 mt-3">Rs. {(p.price ?? 0).toLocaleString("en-IN")}</p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-white/5 flex gap-2">
                        <Link href="/products" className="btn-secondary !py-1.5 !px-3 text-[10px] flex-1 text-center">
                          View details
                        </Link>
                        <a
                          href={`https://wa.me/918088979706?text=Enquiry: ${encodeURIComponent(p.title)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary !py-1.5 !px-3 text-[10px] flex-1 text-center bg-[#25D366] hover:bg-[#20ba5a]"
                        >
                          Enquire
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Notifications */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-xl font-bold text-white">Notifications Feed</h1>
                <p className="text-xs text-nex-mist mt-0.5">Private account security alerts and service status notices.</p>
              </div>

              <div className="space-y-3">
                {notifications.map((n) => (
                  <div key={n.id} className="glass-card p-4 bg-nex-ink border border-white/5 rounded-2xl flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-nex-blueLight mt-1.5 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-white/95">{n.title}</h4>
                      <p className="text-[11px] text-nex-mist mt-0.5">{n.message}</p>
                      <span className="text-[9px] text-white/40 block mt-2">{n.created_at ? new Date(n.created_at).toLocaleString("en-IN") : ""}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab: Profile */}
          {activeTab === "profile" && (
            <div className="space-y-6 max-w-lg">
              <div>
                <h1 className="font-display text-xl font-bold text-white">Profile & Security Credentials</h1>
                <p className="text-xs text-nex-mist mt-0.5">Edit customer display details and view secure tokens.</p>
              </div>

              <div className="glass-card p-6 bg-nex-ink border border-white/5 rounded-2xl">
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-1">
                    <label htmlFor="prof-name" className="text-xs font-semibold text-white/80">Display Name</label>
                    <input
                      id="prof-name"
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-white/60">Registered Email (Read-Only)</label>
                    <input
                      type="email"
                      disabled
                      value={userEmail}
                      className="w-full rounded-xl bg-white/[0.01] border border-white/[0.04] px-3.5 py-2.5 text-xs text-white/40 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="prof-phone" className="text-xs font-semibold text-white/80">Phone Number</label>
                    <input
                      id="prof-phone"
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button type="submit" className="btn-primary text-xs !py-2.5 !px-5">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Tab: Support Ticket System */}
          {activeTab === "support" && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-xl font-bold text-white">Helpdesk Support Tickets</h1>
                <p className="text-xs text-nex-mist mt-0.5">Submit hardware queries or remote setup issues directly to our system technicians.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left: Form */}
                <div className="lg:col-span-5 glass-card p-6 bg-nex-ink border border-white/5 rounded-2xl">
                  <h3 className="font-display text-xs font-bold text-white mb-4">Create Support Request</h3>
                  
                  {ticketSuccess && (
                    <div className="p-3.5 rounded-xl bg-green-500/10 border border-green-500/20 text-xs text-green-400 font-semibold mb-4">
                      Ticket submitted. Check response in list.
                    </div>
                  )}

                  <form onSubmit={handleCreateTicket} className="space-y-4">
                    <div className="space-y-1">
                      <label htmlFor="tk-sub" className="text-xs font-semibold text-white/80">Subject / Issue Summary</label>
                      <input
                        id="tk-sub"
                        type="text"
                        required
                        value={ticketSubject}
                        onChange={(e) => setTicketSubject(e.target.value)}
                        placeholder="e.g. Broken laptop keyboard hinge"
                        className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="tk-msg" className="text-xs font-semibold text-white/80">Detailed description</label>
                      <textarea
                        id="tk-msg"
                        required
                        value={ticketMsg}
                        onChange={(e) => setTicketMsg(e.target.value)}
                        placeholder="Describe issue specifications..."
                        rows={4}
                        className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none resize-none"
                      />
                    </div>

                    <button type="submit" className="btn-primary text-xs !py-2.5 w-full text-center">
                      Submit Ticket
                    </button>
                  </form>
                </div>

                {/* Right: List */}
                <div className="lg:col-span-7 space-y-4">
                  <h3 className="font-display text-xs font-bold text-white">Active &amp; Past Tickets</h3>
                  
                  {tickets.map((t) => (
                    <div key={t.id} className="glass-card p-5 bg-nex-ink border border-white/5 rounded-2xl">
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-bold text-white">{t.subject}</h4>
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                          t.status === "open" ? "bg-nex-blue/20 text-nex-blueLight" : "bg-white/5 text-nex-mist"
                        }`}>
                          {t.status}
                        </span>
                      </div>
                      <div className="mt-3 bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl text-[10px]">
                        <p className="text-nex-mist">Support Reply:</p>
                        <p className="text-white mt-1 font-semibold">{t.reply}</p>
                      </div>
                      <span className="text-[9px] text-white/35 block mt-2">Submitted on: {t.created_at}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
