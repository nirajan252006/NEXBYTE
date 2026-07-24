"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { User, Mail, Phone, Lock, ArrowRight, Sparkles, CheckCircle } from "lucide-react";
import { dbHelper } from "@/lib/dbHelper";

export default function CustomerLoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        // Register flow
        if (!fullName || !phone || !email || !password) {
          setError("All fields are required.");
          setLoading(false);
          return;
        }

        // Create user in database
        const existing = await dbHelper.users.getByEmail(email);
        if (existing) {
          setError("A user with this email already exists.");
          setLoading(false);
          return;
        }

        const newUser = await dbHelper.users.create({
          email,
          full_name: fullName,
          phone,
        });

        // Set session via mock endpoint
        const res = await fetch("/api/customer/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, userId: newUser.id, fullName: newUser.full_name }),
        });

        if (res.ok) {
          setSuccess(true);
          setTimeout(() => {
            router.replace("/customer");
          }, 1500);
        } else {
          setError("Registration completed, but failed to establish session.");
        }
      } else {
        // Login flow
        if (!email || !password) {
          setError("Please provide email and password.");
          setLoading(false);
          return;
        }

        // Fetch user
        const user = await dbHelper.users.getByEmail(email);
        if (!user) {
          // If mock mode, let's auto-create user on any new login to make it super frictionless for the user!
          const autoUser = await dbHelper.users.create({
            email,
            full_name: email.split("@")[0],
            phone: "9876543210"
          });
          const res = await fetch("/api/customer/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, userId: autoUser.id, fullName: autoUser.full_name }),
          });
          if (res.ok) {
            router.replace("/customer");
            return;
          }
        }

        // Set session
        const res = await fetch("/api/customer/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, userId: user.id, fullName: user.full_name }),
        });

        if (res.ok) {
          router.replace("/customer");
        } else {
          setError("Failed to establish portal session.");
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-nex-black flex items-center justify-center px-5 py-12 overflow-hidden">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-nex-blue/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-40 right-1/4 h-[500px] w-[500px] rounded-full bg-nex-blueLight/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 group justify-center">
            <div className="relative h-11 w-11">
              <div className="absolute inset-0 rounded-full bg-nex-blue/30 blur-md group-hover:bg-nex-blue/50 transition-colors" />
              <Image
                src="/images/logo-icon-transparent.png"
                alt="NexByte Technologies logo"
                fill
                sizes="44px"
                className="relative object-contain"
                priority
              />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight text-white">
              NEX<span className="text-nex-blueLight">BYTE</span>
            </span>
          </Link>
          <h2 className="font-display text-lg font-bold text-white">
            {isRegister ? "Create Customer Account" : "Access Customer Portal"}
          </h2>
          <p className="text-xs text-nex-mist mt-1">
            {isRegister ? "Join to track bookings and download invoices." : "Track booking progress, invoices, and certificates."}
          </p>
        </div>

        {/* Portal card */}
        <div className="glass-card p-6 md:p-8 bg-nex-ink border border-white/5 rounded-2xl shadow-glow-blue relative">
          
          {success ? (
            <div className="text-center py-10 space-y-4">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto animate-bounce" />
              <h3 className="font-display text-sm font-bold text-white">Registration Successful!</h3>
              <p className="text-xs text-nex-mist">Creating your client profile workspace...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-semibold">
                  {error}
                </div>
              )}

              {isRegister && (
                <>
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label htmlFor="auth-fullname" className="text-xs font-semibold text-white/85 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-nex-blueLight" /> Full Name *
                    </label>
                    <input
                      id="auth-fullname"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3.5 py-2.5 text-xs text-white focus:border-nex-blue/50 focus:outline-none"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label htmlFor="auth-phone" className="text-xs font-semibold text-white/85 flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-nex-blueLight" /> Phone Number *
                    </label>
                    <input
                      id="auth-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3.5 py-2.5 text-xs text-white focus:border-nex-blue/50 focus:outline-none"
                    />
                  </div>
                </>
              )}

              {/* Email */}
              <div className="space-y-1">
                <label htmlFor="auth-email" className="text-xs font-semibold text-white/85 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-nex-blueLight" /> Email Address *
                </label>
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. ramesh@gmail.com"
                  className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3.5 py-2.5 text-xs text-white focus:border-nex-blue/50 focus:outline-none"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label htmlFor="auth-pass" className="text-xs font-semibold text-white/85 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-nex-blueLight" /> Password *
                </label>
                <input
                  id="auth-pass"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3.5 py-2.5 text-xs text-white focus:border-nex-blue/50 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary flex items-center justify-center gap-2 text-xs font-bold"
                >
                  {loading ? "Authenticating..." : isRegister ? "Sign Up Now" : "Sign In to Portal"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          )}

          {/* Toggle Tab */}
          {!success && (
            <div className="mt-6 pt-4 border-t border-white/[0.04] text-center text-xs text-nex-mist">
              {isRegister ? (
                <p>
                  Already have an account?{" "}
                  <button onClick={() => setIsRegister(false)} className="text-nex-blueLight font-semibold hover:underline">
                    Sign In
                  </button>
                </p>
              ) : (
                <p>
                  Don&apos;t have a profile yet?{" "}
                  <button onClick={() => setIsRegister(true)} className="text-nex-blueLight font-semibold hover:underline">
                    Register Profile
                  </button>
                </p>
              )}
            </div>
          )}

        </div>

      </div>
    </main>
  );
}
