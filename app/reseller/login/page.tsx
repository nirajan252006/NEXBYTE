"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Building2, Mail, Phone, Lock, ArrowRight, CheckCircle,
  User, MapPin, Briefcase, FileText, Eye, EyeOff, Loader2,
  ShieldCheck
} from "lucide-react";

type Mode = "login" | "register";

export default function ResellerLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register fields
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regCity, setRegCity] = useState("");
  const [regState, setRegState] = useState("");
  const [businessType, setBusinessType] = useState("individual");
  const [gstin, setGstin] = useState("");
  const [description, setDescription] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/reseller/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed.");
        return;
      }
      router.replace("/reseller");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (regPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (regPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/reseller/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName, ownerName, email: regEmail, phone: regPhone,
          city: regCity, state: regState, businessType, gstin, description,
          password: regPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed.");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:border-nex-blue/50 focus:outline-none transition-colors";
  const labelCls = "text-[11px] font-semibold text-white/80 flex items-center gap-1.5 mb-1";

  return (
    <main className="relative min-h-screen bg-nex-black flex items-center justify-center px-5 py-12 overflow-hidden">
      {/* Background glows */}
      <div className="pointer-events-none absolute -top-40 left-1/3 h-[600px] w-[600px] rounded-full bg-nex-blue/8 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-20 right-1/4 h-[400px] w-[400px] rounded-full bg-purple-600/8 blur-[120px]" />

      <div className="relative z-10 w-full max-w-xl">

        {/* Brand header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-5 group justify-center">
            <div className="relative h-11 w-11">
              <div className="absolute inset-0 rounded-full bg-nex-blue/30 blur-md group-hover:bg-nex-blue/50 transition-colors" />
              <Image src="/images/logo-icon-transparent.png" alt="NexByte" fill sizes="44px" className="relative object-contain" priority />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight text-white">
              NEX<span className="text-nex-blueLight">BYTE</span>
            </span>
          </Link>

          {/* Mode toggle */}
          <div className="inline-flex items-center rounded-2xl bg-white/[0.04] border border-white/[0.08] p-1 gap-1">
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className={`px-5 py-2 text-xs font-bold rounded-xl transition-all ${mode === "login" ? "bg-nex-blue text-white shadow-glow-blue" : "text-white/50 hover:text-white"}`}
            >
              Reseller Login
            </button>
            <button
              onClick={() => { setMode("register"); setError(""); }}
              className={`px-5 py-2 text-xs font-bold rounded-xl transition-all ${mode === "register" ? "bg-purple-600 text-white" : "text-white/50 hover:text-white"}`}
            >
              Become a Reseller
            </button>
          </div>

          <p className="text-[11px] text-nex-mist mt-3">
            {mode === "login"
              ? "Sign in to manage your products, orders, and customers."
              : "Register as a NexByte partner. Admin approval required."}
          </p>
        </div>

        <div className="glass-panel p-6 md:p-8 bg-nex-ink border border-white/[0.07] rounded-2xl shadow-glow-blue relative">

          {/* ── LOGIN MODE ── */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-9 w-9 rounded-xl bg-nex-blue/10 border border-nex-blue/20 text-nex-blueLight flex items-center justify-center">
                  <Building2 className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-white">Reseller Portal</h2>
                  <p className="text-[10px] text-nex-mist">NexByte Partner Management System</p>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">{error}</div>
              )}

              <div>
                <label className={labelCls}><Mail className="h-3.5 w-3.5 text-nex-blueLight" /> Email Address *</label>
                <input id="res-email" type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                  placeholder="e.g. reseller@nexbyte.com" className={inputCls} />
              </div>

              <div>
                <label className={labelCls}><Lock className="h-3.5 w-3.5 text-nex-blueLight" /> Password *</label>
                <div className="relative">
                  <input id="res-pass" type={showPassword ? "text" : "password"} required value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••" className={inputCls + " pr-10"} />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-1">
                <button type="submit" disabled={loading}
                  className="w-full btn-primary flex items-center justify-center gap-2 text-xs font-bold">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ArrowRight className="h-4 w-4" /> Sign In to Reseller Dashboard</>}
                </button>
              </div>

              <div className="text-center text-[11px] text-nex-mist pt-1">
                <span>Dev credentials: </span>
                <span className="font-mono text-nex-blueLight">reseller@nexbyte.com</span>
                <span> / any password</span>
              </div>
            </form>
          )}

          {/* ── REGISTER MODE ── */}
          {mode === "register" && (
            success ? (
              <div className="text-center py-8 space-y-4">
                <div className="h-16 w-16 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h3 className="font-display text-lg font-bold text-white">Application Submitted!</h3>
                <p className="text-xs text-nex-mist max-w-xs mx-auto leading-relaxed">
                  Your reseller application has been submitted to NexByte admin for review.
                  You will be notified via email once approved.
                </p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <ShieldCheck className="h-4 w-4 text-nex-blueLight" />
                  <span className="text-[11px] text-nex-blueLight font-semibold">Application under review</span>
                </div>
                <button onClick={() => { setMode("login"); setSuccess(false); }}
                  className="btn-primary !py-2.5 !px-6 text-xs mt-2">
                  Go to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-9 w-9 rounded-xl bg-purple-600/10 border border-purple-600/20 text-purple-400 flex items-center justify-center">
                    <Briefcase className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h2 className="font-display text-base font-bold text-white">Partner Registration</h2>
                    <p className="text-[10px] text-nex-mist">Pending admin approval after signup</p>
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">{error}</div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}><Building2 className="h-3.5 w-3.5 text-purple-400" /> Business Name *</label>
                    <input required value={businessName} onChange={e => setBusinessName(e.target.value)}
                      placeholder="e.g. TechZone Store" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}><User className="h-3.5 w-3.5 text-purple-400" /> Owner Name *</label>
                    <input required value={ownerName} onChange={e => setOwnerName(e.target.value)}
                      placeholder="e.g. Kiran B." className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}><Mail className="h-3.5 w-3.5 text-purple-400" /> Email *</label>
                    <input type="email" required value={regEmail} onChange={e => setRegEmail(e.target.value)}
                      placeholder="business@email.com" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}><Phone className="h-3.5 w-3.5 text-purple-400" /> Phone *</label>
                    <input type="tel" required value={regPhone} onChange={e => setRegPhone(e.target.value)}
                      placeholder="9876543210" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}><MapPin className="h-3.5 w-3.5 text-purple-400" /> City *</label>
                    <input required value={regCity} onChange={e => setRegCity(e.target.value)}
                      placeholder="e.g. Bengaluru" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}><MapPin className="h-3.5 w-3.5 text-purple-400" /> State</label>
                    <input value={regState} onChange={e => setRegState(e.target.value)}
                      placeholder="Karnataka" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}><Briefcase className="h-3.5 w-3.5 text-purple-400" /> Business Type</label>
                    <select value={businessType} onChange={e => setBusinessType(e.target.value)}
                      className={inputCls + " bg-nex-ink"}>
                      <option value="individual">Individual / Freelancer</option>
                      <option value="proprietorship">Proprietorship</option>
                      <option value="partnership">Partnership</option>
                      <option value="pvt_ltd">Private Limited</option>
                      <option value="llp">LLP</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}><FileText className="h-3.5 w-3.5 text-purple-400" /> GSTIN (Optional)</label>
                    <input value={gstin} onChange={e => setGstin(e.target.value)}
                      placeholder="22AAAAA0000A1Z5" className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className={labelCls}><FileText className="h-3.5 w-3.5 text-purple-400" /> Business Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
                    placeholder="Brief description of your business and products you plan to sell..."
                    className={inputCls + " resize-none"} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}><Lock className="h-3.5 w-3.5 text-purple-400" /> Password *</label>
                    <input type="password" required minLength={8} value={regPassword} onChange={e => setRegPassword(e.target.value)}
                      placeholder="Min 8 characters" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}><Lock className="h-3.5 w-3.5 text-purple-400" /> Confirm Password *</label>
                    <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password" className={inputCls} />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-[11px] text-amber-300/80">
                  ⚠️ Your account will be reviewed by NexByte admin before activation. This typically takes 1–2 business days.
                </div>

                <button type="submit" disabled={loading}
                  className="w-full !py-3 !px-4 text-xs font-bold flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-nex-blue text-white hover:opacity-90 transition-opacity">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Briefcase className="h-4 w-4" /> Submit Reseller Application</>}
                </button>
              </form>
            )
          )}
        </div>

        <div className="mt-6 text-center text-[11px] text-nex-mist">
          <Link href="/admin/login" className="text-white/30 hover:text-white/60 transition-colors">Admin Login</Link>
          <span className="mx-2 text-white/20">·</span>
          <Link href="/customer/login" className="text-white/30 hover:text-white/60 transition-colors">Customer Login</Link>
          <span className="mx-2 text-white/20">·</span>
          <Link href="/" className="text-white/30 hover:text-white/60 transition-colors">Back to Website</Link>
        </div>
      </div>
    </main>
  );
}
