"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  Mail,
  AlertTriangle,
  Eye,
  EyeOff,
  ShieldCheck,
  User,
  Building2,
  Shield,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Calendar
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");

  const [selectedRole, setSelectedRole] = useState<"user" | "reseller" | "admin">("user");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [forgotDob, setForgotDob] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const redirectTarget = searchParams.get("redirect");

  useEffect(() => {
    if (roleParam === "admin" || roleParam === "reseller" || roleParam === "user") {
      setSelectedRole(roleParam);
    }
  }, [roleParam]);

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim() || !forgotDob) {
      return setErrorMsg("Please enter both Email/Phone and Date of Birth.");
    }
    setForgotLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailOrPhone,
          dateOfBirth: forgotDob,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Password reset identity verification failed.");
      }

      if (data.redirectUrl) {
        router.push(data.redirectUrl);
      } else {
        setErrorMsg("Identity verified. Check your recovery instructions.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Verification failed. Please check your credentials.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim() || !password.trim()) {
      return setErrorMsg("Please enter both Email/Phone and Password.");
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailOrPhone,
          password,
          role: selectedRole,
          rememberMe,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      // Redirect logic:
      if (selectedRole === "admin") {
        router.replace("/admin");
      } else if (selectedRole === "reseller") {
        router.replace("/reseller");
      } else if (redirectTarget) {
        router.replace(redirectTarget);
      } else {
        router.replace("/customer");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[100svh] w-full items-center justify-center bg-nex-black px-5 py-12 overflow-hidden">
      {/* Background radial glow */}
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
            Account <span className="text-gradient-blue">Sign In.</span>
          </h1>
          <p className="mt-1 text-xs text-nex-mist">
            Select your account access level to enter the platform.
          </p>
        </div>

        {/* Card Panel */}
        <div className="glass-card border border-white/10 bg-nex-ink p-7 shadow-glow-blue sm:p-8">
          
          {/* Role Selection Matrix */}
          <div className="mb-6">
            <label className="text-[11px] font-bold text-nex-mist uppercase tracking-wider block mb-2">
              Select Account Role
            </label>
            <div className="grid grid-cols-3 gap-2 bg-nex-black p-1.5 rounded-xl border border-white/10">
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
                <span>USER</span>
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

              <button
                type="button"
                onClick={() => { setSelectedRole("admin"); setErrorMsg(""); }}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                  selectedRole === "admin"
                    ? "bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)] font-extrabold"
                    : "text-nex-mist hover:text-white hover:bg-white/5"
                }`}
              >
                <Shield className="h-4 w-4 mb-1" />
                <span>ADMIN</span>
              </button>
            </div>
          </div>

          {/* Banners */}
          {errorMsg && (
            <div className="mb-5 rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 text-xs text-red-400 flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Dev Helper Tips */}
          {selectedRole === "admin" && (
            <div className="mb-5 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-[11px] text-amber-300 leading-relaxed">
              <strong>Admin Dev Login</strong> — Email: <code className="font-mono bg-black/40 px-1 py-0.5 rounded text-white">admin@nexbyte.com</code> &nbsp;•&nbsp; Password: <code className="font-mono bg-black/40 px-1 py-0.5 rounded text-white">admin123</code>
            </div>
          )}

          {selectedRole === "reseller" && (
            <div className="mb-5 rounded-xl bg-purple-500/10 border border-purple-500/20 p-3 text-[11px] text-purple-300 leading-relaxed">
              <strong>Reseller Dev Login</strong> — Email: <code className="font-mono bg-black/40 px-1 py-0.5 rounded text-white">reseller@nexbyte.com</code> &nbsp;•&nbsp; Any password
            </div>
          )}

          {showForgot ? (
            <form onSubmit={handleForgotSubmit} className="space-y-4 py-1">
              <div className="text-center mb-2">
                <HelpCircle className="h-8 w-8 text-nex-blueLight mx-auto mb-1" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">FORGOT PASSWORD</h3>
                <p className="text-[11px] text-nex-mist">
                  Step 1: Enter Email/Phone &nbsp;•&nbsp; Step 2: Confirm Date of Birth
                </p>
              </div>

              {/* Step 1: Email OR Phone */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/80">Step 1: Email or Phone Number</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-nex-mist" />
                  <input
                    type="text"
                    required
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="name@domain.com or phone"
                    className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] pl-10 pr-4 py-3 text-xs text-white placeholder-white/20 focus:border-nex-blue/50 focus:outline-none focus:ring-1 focus:ring-nex-blue/30"
                  />
                </div>
              </div>

              {/* Step 2: Date of Birth */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white/80">Step 2: Date of Birth</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-nex-mist" />
                  <input
                    type="date"
                    required
                    max={new Date().toISOString().split("T")[0]}
                    value={forgotDob}
                    onChange={(e) => setForgotDob(e.target.value)}
                    className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] pl-10 pr-4 py-3 text-xs text-white placeholder-white/20 focus:border-nex-blue/50 focus:outline-none focus:ring-1 focus:ring-nex-blue/30 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowForgot(false); setErrorMsg(""); }}
                  className="btn-secondary w-1/3 py-3 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="btn-primary w-2/3 py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-glow-blue"
                >
                  {forgotLoading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <>
                      <span>Verify Identity</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email / Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/80">Email Address or Registered Phone</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-nex-mist" />
                  <input
                    type="text"
                    required
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder={
                      selectedRole === "admin"
                        ? "admin@nexbyte.com"
                        : selectedRole === "reseller"
                        ? "reseller@nexbyte.com"
                        : "name@domain.com or phone"
                    }
                    className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] pl-10 pr-4 py-3 text-xs text-white placeholder-white/20 focus:border-nex-blue/50 focus:outline-none focus:ring-1 focus:ring-nex-blue/30"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-white/80">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="text-[11px] text-nex-blueLight hover:underline font-medium"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-nex-mist" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
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

              {/* Options */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-white/20 bg-white/5 text-nex-blue focus:ring-0"
                  />
                  <span className="text-xs text-nex-mist">Remember me</span>
                </label>
                
                <Link href="/signup" className="text-xs text-nex-blueLight hover:underline font-semibold">
                  Need an Account?
                </Link>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 text-xs font-bold flex items-center justify-center gap-2 rounded-xl transition-all ${
                    selectedRole === "admin"
                      ? "bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                      : selectedRole === "reseller"
                      ? "bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)]"
                      : "btn-primary shadow-glow-blue"
                  }`}
                >
                  {loading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <>
                      <span>Sign In as {selectedRole.toUpperCase()}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Secondary Navigation */}
        <div className="mt-6 text-center space-y-2">
          {selectedRole === "reseller" ? (
            <p className="text-xs text-nex-mist">
              Want to sell hardware on NexByte?{" "}
              <Link href="/signup" className="text-purple-400 hover:underline font-bold">
                Become a Partner
              </Link>
            </p>
          ) : (
            <p className="text-xs text-nex-mist">
              Back to{" "}
              <Link href="/" className="text-nex-blueLight hover:underline font-bold">
                NexByte Customer Website
              </Link>
            </p>
          )}

          <div className="pt-1">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] text-nex-mist">
              <ShieldCheck className="h-3 w-3 text-nex-blueLight" />
              Server-Side RBAC Verification Active
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function UnifiedLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-nex-black flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-nex-blueLight border-t-transparent animate-spin" />
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
