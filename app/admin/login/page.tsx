"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, AlertTriangle, Send, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      return setErrorMsg("Please enter both email and password.");
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed.");
      }

      router.replace("/admin");
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[100svh] w-full items-center justify-center bg-nex-black px-5 py-12 overflow-hidden">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute inset-0 bg-hero-radial opacity-80" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-nex-blue/15 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Branding header */}
        <div className="mb-8 text-center">
          <span className="section-eyebrow">
            <span className="h-1.5 w-1.5 rounded-full bg-nex-blueLight shadow-glow-blue" />
            Security Gateway
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Admin <span className="text-gradient-blue">Control Panel.</span>
          </h1>
          <p className="mt-2 text-xs text-nex-mist">
            Authorized administrative access only.
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card border border-white/10 bg-nex-ink p-8 shadow-glow-blue">
          {errorMsg && (
            <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-xs text-red-400 flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Development helper tip */}
          <div className="mb-6 rounded-xl bg-blue-500/10 border border-blue-500/20 p-3.5 text-xs text-blue-400 leading-relaxed">
            <strong>Dev Credentials</strong> — Email: <code className="font-mono bg-white/10 px-1 rounded">admin@nexbyte.com</code> &nbsp;·&nbsp; Password: <code className="font-mono bg-white/10 px-1 rounded">admin123</code>
          </div>

          {showForgot ? (
            /* Forgot Password Panel */
            <div className="space-y-5">
              <div className="text-center">
                <ShieldCheck className="h-10 w-10 text-nex-blueLight mx-auto mb-3" />
                <h3 className="font-display text-base font-bold text-white">Reset Password</h3>
                <p className="text-xs text-nex-mist mt-2 leading-relaxed">
                  Contact the system administrator or use your Supabase dashboard to reset your admin password.
                </p>
              </div>

              <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4 text-xs text-nex-mist space-y-2">
                <p><strong className="text-white">Option 1:</strong> Go to your Supabase project → Authentication → Users → Reset password</p>
                <p><strong className="text-white">Option 2:</strong> Contact <span className="text-nex-blueLight">admin@nexbyte.com</span> for password recovery</p>
              </div>

              <button
                onClick={() => setShowForgot(false)}
                className="w-full btn-secondary text-xs !py-3"
              >
                ← Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email field */}
              <div className="space-y-1.5">
                <label htmlFor="login-email" className="text-xs font-semibold text-white/80">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-nex-mist" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@nexbytetechnologies.com"
                    className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] pl-10 pr-4 py-3.5 text-sm text-white placeholder-white/20 focus:border-nex-blue/50 focus:outline-none focus:ring-1 focus:ring-nex-blue/30"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <label htmlFor="login-password" className="text-xs font-semibold text-white/80">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-nex-mist" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] pl-10 pr-12 py-3.5 text-sm text-white placeholder-white/20 focus:border-nex-blue/50 focus:outline-none focus:ring-1 focus:ring-nex-blue/30"
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

              {/* Remember Me + Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-nex-black border-white/20 text-nex-blue focus:ring-0 h-3.5 w-3.5"
                  />
                  <span className="text-xs text-nex-mist">Remember Me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-xs text-nex-blueLight hover:underline font-medium"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <Lock className="h-4 w-4" /> Authenticate
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Role badge */}
        <div className="mt-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] text-nex-mist">
            <ShieldCheck className="h-3 w-3 text-nex-blueLight" />
            Role-Based Access Control Active
          </span>
        </div>
      </div>
    </div>
  );
}
