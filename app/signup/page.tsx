"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Phone,
  FileText,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function SignupPage() {
  const [selectedRole, setSelectedRole] = useState<"user" | "reseller">("user");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [gstin, setGstin] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      return setErrorMsg("Please fill in all required fields.");
    }
    if (password.length < 6) {
      return setErrorMsg("Password must be at least 6 characters.");
    }
    if (password !== confirmPassword) {
      return setErrorMsg("Passwords do not match.");
    }
    if (!phone.trim()) {
      return setErrorMsg("Phone number is required.");
    }
    if (selectedRole === "user") {
      if (!dateOfBirth) {
        return setErrorMsg("Date of Birth is required for customer accounts.");
      }
      const dobDate = new Date(dateOfBirth);
      if (isNaN(dobDate.getTime()) || dobDate > new Date()) {
        return setErrorMsg("Date of Birth cannot be a future date or invalid.");
      }
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          password,
          dateOfBirth: selectedRole === "user" ? dateOfBirth : undefined,
          role: selectedRole,
          businessName: selectedRole === "reseller" ? businessName : undefined,
          gstin: selectedRole === "reseller" ? gstin : undefined,
          businessDescription: selectedRole === "reseller" ? businessDescription : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed.");
      }

      if (selectedRole === "reseller") {
        setSuccessMsg("Reseller application submitted! An admin will review and approve your account.");
      } else {
        setSuccessMsg("Account created successfully! Redirecting to sign in...");
      }
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected registration error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[100svh] w-full items-center justify-center bg-nex-black px-5 py-12 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-hero-radial opacity-80" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-nex-blue/15 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Branding Header */}
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
            <div className="relative h-10 w-10">
              <div className="absolute inset-0 rounded-full bg-nex-blue/30 blur-md group-hover:bg-nex-blue/50 transition-colors" />
              <Image
                src="/images/logo-icon-transparent.png"
                alt="NexByte Technologies"
                fill
                className="relative object-contain"
                priority
              />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-white">
              NEX<span className="text-nex-blueLight">BYTE</span>
            </span>
          </Link>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Create an <span className="text-gradient-blue">Account.</span>
          </h1>
          <p className="mt-1 text-xs text-nex-mist">
            Join NexByte to access hardware, IT services, or partner tools.
          </p>
        </div>

        {/* Card Panel */}
        <div className="glass-card border border-white/10 bg-nex-ink p-7 shadow-glow-blue sm:p-8">
          {/* Role Selection — Admin not available */}
          <div className="mb-6">
            <label className="text-[11px] font-bold text-nex-mist uppercase tracking-wider block mb-2">
              Select Account Type
            </label>
            <div className="grid grid-cols-2 gap-2 bg-nex-black p-1.5 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => { setSelectedRole("user"); setErrorMsg(""); }}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                  selectedRole === "user"
                    ? "bg-nex-blue text-white shadow-glow-blue font-bold"
                    : "text-nex-mist hover:text-white hover:bg-white/5"
                }`}
              >
                <User className="h-4 w-4 mb-1" />
                <span>CUSTOMER</span>
              </button>

              <button
                type="button"
                onClick={() => { setSelectedRole("reseller"); setErrorMsg(""); }}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                  selectedRole === "reseller"
                    ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)] font-bold"
                    : "text-nex-mist hover:text-white hover:bg-white/5"
                }`}
              >
                <Building2 className="h-4 w-4 mb-1" />
                <span>RESELLER</span>
              </button>
            </div>
            <p className="mt-2 text-[10px] text-nex-mist/60 text-center">
              Admin accounts cannot be self-assigned. Admins are created by authorized administrators.
            </p>
          </div>

          {/* Info bar for reseller */}
          {selectedRole === "reseller" && (
            <div className="mb-5 rounded-xl bg-purple-500/10 border border-purple-500/20 p-3 text-[11px] text-purple-300 leading-relaxed">
              <strong>Reseller Application</strong> — Your account will be reviewed by NexByte Admin. You&apos;ll be notified once approved.
            </div>
          )}

          {/* Banners */}
          {errorMsg && (
            <div className="mb-5 rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 text-xs text-red-400 flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-xs text-emerald-400 flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-3.5">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/80">
                {selectedRole === "reseller" ? "Full Name / Business Owner" : "Full Name"} *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ramesh Kumar"
                className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3.5 py-3 text-xs text-white placeholder-white/20 focus:border-nex-blue/50 focus:outline-none focus:ring-1 focus:ring-nex-blue/30"
              />
            </div>

            {/* Reseller fields */}
            {selectedRole === "reseller" && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white/80">Business Name *</label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-nex-mist" />
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="TechZone Computers"
                      className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] pl-10 pr-4 py-3 text-xs text-white placeholder-white/20 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white/80">GSTIN (Optional)</label>
                  <div className="relative">
                    <FileText className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-nex-mist" />
                    <input
                      type="text"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value)}
                      placeholder="29ABCDE1234F1Z5"
                      className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] pl-10 pr-4 py-3 text-xs text-white placeholder-white/20 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white/80">Business Description</label>
                  <textarea
                    value={businessDescription}
                    onChange={(e) => setBusinessDescription(e.target.value)}
                    placeholder="Tell us about your business, products you sell, areas you serve..."
                    rows={2}
                    className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3.5 py-3 text-xs text-white placeholder-white/20 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30 resize-none"
                  />
                </div>
              </>
            )}

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/80">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-nex-mist" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] pl-10 pr-4 py-3 text-xs text-white placeholder-white/20 focus:border-nex-blue/50 focus:outline-none focus:ring-1 focus:ring-nex-blue/30"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/80">Phone Number *</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-nex-mist" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] pl-10 pr-4 py-3 text-xs text-white placeholder-white/20 focus:border-nex-blue/50 focus:outline-none focus:ring-1 focus:ring-nex-blue/30"
                />
              </div>
            </div>

            {/* Date of Birth */}
            {selectedRole === "user" && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/80">Date of Birth *</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-nex-mist" />
                  <input
                    type="date"
                    required
                    max={new Date().toISOString().split("T")[0]}
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] pl-10 pr-4 py-3 text-xs text-white placeholder-white/20 focus:border-nex-blue/50 focus:outline-none focus:ring-1 focus:ring-nex-blue/30 text-white"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/80">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-nex-mist" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] pl-10 pr-12 py-3 text-xs text-white placeholder-white/20 focus:border-nex-blue/50 focus:outline-none focus:ring-1 focus:ring-nex-blue/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-nex-mist hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white/80">Confirm Password *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-nex-mist" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className={`w-full rounded-xl bg-white/[0.04] border px-3.5 pl-10 pr-12 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:ring-1 ${
                    confirmPassword && confirmPassword !== password
                      ? "border-red-500/30 focus:border-red-500/50 focus:ring-red-500/30"
                      : "border-white/[0.08] focus:border-nex-blue/50 focus:ring-nex-blue/30"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-nex-mist hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p className="text-[10px] text-red-400 mt-1">Passwords do not match.</p>
              )}
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 text-xs font-bold flex items-center justify-center gap-2 rounded-xl transition-all ${
                  selectedRole === "reseller"
                    ? "bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)]"
                    : "btn-primary shadow-glow-blue"
                }`}
              >
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <>
                    <span>
                      {selectedRole === "reseller" ? "Submit Reseller Application" : "Create Account"}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-xs text-nex-mist">
            Already have an account?{" "}
            <Link href="/login" className="text-nex-blueLight hover:underline font-bold">
              Sign In
            </Link>
          </p>
          <p className="text-xs text-nex-mist">
            <Link href="/" className="text-white/40 hover:text-white/60 hover:underline text-[10px]">
              ← Back to NexByte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
