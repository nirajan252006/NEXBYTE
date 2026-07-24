"use client";

import React, { useEffect, useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, Loader2, Award, Download, ShieldCheck, HelpCircle, UserCheck } from "lucide-react";
import Image from "next/image";

export default function VerifyPage() {
  const [regId, setRegId] = useState("");
  const [certNum, setCertNum] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [certificate, setCertificate] = useState<any>(null);
  
  const printRef = useRef<HTMLDivElement>(null);

  // Auto load if regid in query params
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const queryId = params.get("regid");
      if (queryId) {
        setRegId(queryId);
        fetchCertificate(queryId);
      }
    }
  }, []);

  const fetchCertificate = async (idToSearch: string) => {
    setLoading(true);
    setHasSearched(true);
    try {
      // Find list of certificates and match
      const res = await fetch("/api/certificates");
      const list = await res.json();
      const match = list.find(
        (c: any) => c.registrationId?.toLowerCase() === idToSearch.trim().toLowerCase()
      );
      setCertificate(match || null);
    } catch {
      alert("Error verifying certificate ID.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regId.trim()) return;
    fetchCertificate(regId);
  };

  const handleDownload = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
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
              NexByte Systems Accreditation
            </span>
            <h1 className="font-display text-3xl font-black tracking-tight text-white sm:text-5xl">
              Verify <span className="text-gradient-blue">Certificate.</span>
            </h1>
            <p className="mt-3 text-xs text-nex-mist leading-relaxed">
              Verify credentials issued by NexByte Technologies. Enter the Registration ID to view authentic training records and placement certification.
            </p>
          </div>

          {/* Form */}
          <div className="glass-rog p-6 border border-cyan-500/20 shadow-glow-blue max-w-2xl mx-auto mb-12 print:hidden">
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-nex-mist">Registration ID *</label>
                  <input
                    type="text"
                    required
                    value={regId}
                    onChange={(e) => setRegId(e.target.value)}
                    placeholder="e.g. NBT-TR-2026-001"
                    className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-nex-mist">Certificate Number (Optional)</label>
                  <input
                    type="text"
                    value={certNum}
                    onChange={(e) => setCertNum(e.target.value)}
                    placeholder="e.g. CERT-908123"
                    className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2 text-xs py-3.5 bg-cyan-600 hover:bg-cyan-500 border-none shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Accredit Certificate"}
              </button>
            </form>
          </div>

          {/* Results */}
          <div className="max-w-3xl mx-auto">
            {loading && (
              <div className="text-center py-20 print:hidden">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mx-auto" />
                <p className="text-xs text-nex-mist mt-3">Fetching verified records...</p>
              </div>
            )}

            {hasSearched && !loading && !certificate && (
              <div className="text-center py-16 glass-rog border-red-500/20 rounded-3xl p-8 print:hidden">
                <span className="text-3xl block mb-3">❌</span>
                <h3 className="font-display text-base font-bold text-white">Registration ID not found.</h3>
                <p className="text-xs text-nex-mist mt-1 max-w-sm mx-auto">
                  Accreditation record is either pending generation or has been deactivated/revoked by admin dashboard.
                </p>
              </div>
            )}

            {hasSearched && !loading && certificate && (
              <div className="space-y-6">
                
                {/* Visual Certificate Card */}
                <div 
                  ref={printRef}
                  className="glass-rog p-8 md:p-12 border-2 border-cyan-400 bg-nex-ink/90 shadow-glow-blue relative overflow-hidden rounded-3xl print:p-0 print:border-none print:shadow-none print:bg-white print:text-black print:rounded-none"
                >
                  
                  {/* Decorative verified watermark badge */}
                  <div className="absolute right-0 bottom-0 opacity-[0.02] pointer-events-none transform translate-x-12 translate-y-12 print:hidden">
                    <Award size={360} />
                  </div>

                  {/* Stamp Banner */}
                  <div className="flex flex-col md:flex-row items-center justify-between border-b border-white/10 pb-6 gap-4 print:border-black/10">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-cyan-400/10 text-cyan-400 rounded-xl flex items-center justify-center border border-cyan-400/20 print:bg-cyan-100">
                        <Award className="h-6 w-6" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-display text-sm font-bold text-white print:text-black">NexByte Academy</h3>
                        <span className="text-[9px] text-nex-mist uppercase tracking-widest block">Systems Certification Portal</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider print:bg-green-100 print:text-green-800 print:border-green-200">
                      <ShieldCheck className="h-4 w-4 shrink-0" /> Verified by NexByte Technologies
                    </div>
                  </div>

                  {/* Student Photo and Bio details */}
                  <div className="mt-8 flex flex-col md:flex-row gap-8 items-start">
                    <div className="relative h-32 w-32 rounded-2xl overflow-hidden border border-white/10 bg-white/5 shrink-0 flex items-center justify-center mx-auto md:mx-0 print:border-black/10">
                      <Image
                        src={certificate.photoUrl || "/images/logo-icon.png"}
                        alt={certificate.studentName}
                        fill
                        sizes="128px"
                        className="object-contain p-2"
                      />
                    </div>

                    <div className="flex-1 space-y-4 text-center md:text-left w-full">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-[10px] text-nex-mist block uppercase">Student Name</span>
                          <span className="font-bold text-white block mt-0.5 text-base print:text-black">{certificate.studentName}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-nex-mist block uppercase">Course Title</span>
                          <span className="font-bold text-white block mt-0.5 print:text-black">{certificate.courseTitle || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-nex-mist block uppercase">Training Domain</span>
                          <span className="font-medium text-white block mt-0.5 print:text-black">{certificate.trainingType || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-nex-mist block uppercase">Internship Domain</span>
                          <span className="font-medium text-white block mt-0.5 print:text-black">{certificate.internshipType || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-nex-mist block uppercase">Live Project Title</span>
                          <span className="font-medium text-white block mt-0.5 print:text-black">{certificate.projectTitle || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-nex-mist block uppercase">Completion Date</span>
                          <span className="font-medium text-white block mt-0.5 print:text-black">
                            {new Date(certificate.completionDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* QR and IDs */}
                  <div className="mt-8 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-6 print:border-black/10">
                    <div className="text-center sm:text-left space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] text-nex-mist block uppercase">Registration ID</span>
                        <span className="font-mono font-bold text-white block print:text-black">{certificate.registrationId}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-nex-mist block uppercase">Certificate number</span>
                        <span className="font-mono font-semibold text-white block print:text-black">{certificate.certificateId}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-1.5">
                      <div className="relative h-24 w-24 bg-white rounded-xl p-1.5 flex items-center justify-center overflow-hidden border border-white/10">
                        {certificate.qrCodeUrl && (
                          <img
                            src={certificate.qrCodeUrl}
                            alt="Verification QR code"
                            className="object-contain h-full w-full"
                          />
                        )}
                      </div>
                      <span className="text-[8px] text-nex-mist uppercase tracking-wider">Certificate QR Code</span>
                    </div>
                  </div>
                </div>

                {/* Print button */}
                <div className="text-center print:hidden">
                  <button 
                    onClick={handleDownload}
                    className="btn-primary !rounded-2xl !py-3.5 !px-8 text-xs bg-cyan-600 hover:bg-cyan-500 border-none shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center gap-2 mx-auto"
                  >
                    <Download className="h-4.5 w-4.5" /> Download / Print Certificate
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
