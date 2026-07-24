"use client";

import React, { useEffect, useState } from "react";
import { Plus, Search, Trash2, Edit3, ShieldAlert, Award, FileText, CheckCircle2, RefreshCw } from "lucide-react";
import { dbHelper } from "@/lib/dbHelper";

export default function AdminCertificatesPage() {
  const [certs, setCerts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Form Fields for Issue/Edit
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [regId, setRegId] = useState("");
  const [certId, setCertId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("/images/logo-icon.png");
  const [courseTitle, setCourseTitle] = useState("");
  const [trainingType, setTrainingType] = useState("");
  const [internshipType, setInternshipType] = useState("N/A");
  const [projectTitle, setProjectTitle] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const list = await dbHelper.certificates.list();
      setCerts(list);
    } catch {
      alert("Failed to load certificates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener("nexbyte-realtime", handler);
    return () => window.removeEventListener("nexbyte-realtime", handler);
  }, []);

  const openAddModal = () => {
    setEditId(null);
    setRegId(`NBT-TR-2026-${Math.floor(100 + Math.random() * 900)}`);
    setCertId(`CERT-${Math.floor(100000 + Math.random() * 900000)}`);
    setStudentName("");
    setCourseTitle("Full Stack Web Development");
    setTrainingType("Advanced Web Technologies");
    setInternshipType("N/A");
    setProjectTitle("");
    setCompletionDate(new Date().toISOString().split("T")[0]);
    setPhoneNumber("");
    setEmail("");
    setShowModal(true);
  };

  const openEditModal = (cert: any) => {
    setEditId(cert.id);
    setRegId(cert.registrationId || "");
    setCertId(cert.certificateId || "");
    setStudentName(cert.studentName || "");
    setCourseTitle(cert.courseTitle || "");
    setTrainingType(cert.trainingType || "");
    setInternshipType(cert.internshipType || "");
    setProjectTitle(cert.projectTitle || "");
    setCompletionDate(cert.completionDate || "");
    setPhoneNumber(cert.phoneNumber || "");
    setEmail(cert.email || "");
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      registrationId: regId,
      certificateId: certId,
      studentName,
      photoUrl,
      courseTitle,
      trainingType,
      internshipType,
      projectTitle,
      completionDate,
      phoneNumber,
      email,
    };

    try {
      if (editId) {
        await dbHelper.certificates.update(editId, payload);
      } else {
        await dbHelper.certificates.create(payload);
      }
      setShowModal(false);
      load();
      window.dispatchEvent(new CustomEvent("nexbyte-realtime"));
    } catch {
      alert("Failed to save certificate.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this certificate record?")) return;
    try {
      await dbHelper.certificates.delete(id);
      load();
      window.dispatchEvent(new CustomEvent("nexbyte-realtime"));
    } catch {
      alert("Failed to delete certificate.");
    }
  };

  const handleStatusChange = async (cert: any, newStatus: string) => {
    try {
      await dbHelper.certificates.update(cert.id, { status: newStatus });
      load();
      window.dispatchEvent(new CustomEvent("nexbyte-realtime"));
    } catch {
      alert("Failed to update status.");
    }
  };

  const filtered = certs.filter((c) => {
    const s = search.toLowerCase();
    return (
      c.studentName?.toLowerCase().includes(s) ||
      c.registrationId?.toLowerCase().includes(s) ||
      c.certificateId?.toLowerCase().includes(s) ||
      c.phoneNumber?.includes(s) ||
      c.email?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <Award className="h-6 w-6 text-cyan-400" /> Certificate Management
          </h1>
          <p className="text-xs text-nex-mist mt-0.5">Issue, update, verify or revoke systems accreditation certificates.</p>
        </div>
        <button onClick={openAddModal} className="btn-primary !py-2 !px-4 text-xs bg-cyan-600 hover:bg-cyan-500 border-none shadow-[0_0_15px_rgba(6,182,212,0.4)]">
          <Plus className="h-4 w-4" /> Issue Certificate
        </button>
      </div>

      {/* Search Filter */}
      <div className="flex items-center gap-3 glass-card p-4 border-cyan-500/10">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, Reg ID, Cert number, email, phone..."
            className="w-full rounded-xl bg-white/[0.03] border border-white/10 pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="text-center py-20">
          <RefreshCw className="h-6 w-6 animate-spin text-cyan-400 mx-auto" />
          <p className="text-xs text-nex-mist mt-2">Loading certificates records...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 glass-card border-white/5">
          <FileText className="h-10 w-10 text-white/20 mx-auto mb-3" />
          <p className="text-xs text-nex-mist">No certificates match your query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((cert) => (
            <div key={cert.id} className="glass-card p-5 border-cyan-500/10 relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3 border-b border-white/5 pb-3">
                  <div>
                    <h3 className="font-bold text-white text-sm">{cert.studentName}</h3>
                    <span className="text-[10px] text-nex-mist block mt-0.5">{cert.courseTitle}</span>
                  </div>
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                    cert.status === "verified" 
                      ? "bg-green-500/10 border-green-500/30 text-green-400" 
                      : "bg-red-500/10 border-red-500/30 text-red-400"
                  }`}>
                    {cert.status}
                  </span>
                </div>

                <div className="space-y-1 text-[11px] text-nex-mist">
                  <p><strong className="text-white">Registration ID:</strong> {cert.registrationId}</p>
                  <p><strong className="text-white">Certificate ID:</strong> {cert.certificateId}</p>
                  <p><strong className="text-white">Date:</strong> {cert.completionDate}</p>
                  <p><strong className="text-white">Phone/Email:</strong> {cert.phoneNumber} | {cert.email}</p>
                </div>
              </div>

              {/* Actions Grid */}
              <div className="mt-5 border-t border-white/5 pt-4 flex flex-wrap gap-2 justify-end">
                <button onClick={() => openEditModal(cert)} className="btn-secondary !py-1.5 !px-3 text-[10px] hover:border-cyan-500/50">
                  <Edit3 className="h-3 w-3" /> Edit
                </button>

                {cert.status === "verified" ? (
                  <button onClick={() => handleStatusChange(cert, "revoked")} className="btn-secondary !py-1.5 !px-3 text-[10px] border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40">
                    <ShieldAlert className="h-3 w-3" /> Revoke
                  </button>
                ) : (
                  <button onClick={() => handleStatusChange(cert, "verified")} className="btn-secondary !py-1.5 !px-3 text-[10px] border-green-500/20 text-green-400 hover:bg-green-500/10 hover:border-green-500/40">
                    <CheckCircle2 className="h-3 w-3" /> Verify
                  </button>
                )}

                <button onClick={() => handleDelete(cert.id)} className="btn-secondary !py-1.5 !px-3 text-[10px] text-red-400 border-red-500/20 hover:bg-red-500/10">
                  <Trash2 className="h-3 w-3" /> Delete
                </button>

                <a href={`/verify?regid=${cert.registrationId}`} target="_blank" rel="noopener noreferrer" className="btn-secondary !py-1.5 !px-3 text-[10px] border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10">
                  Print QR / PDF
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Popup */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-lg glass-panel bg-nex-ink border border-cyan-500/20 p-6 rounded-2xl shadow-glow-blue max-h-[90vh] overflow-y-auto">
            <h3 className="font-display text-lg font-bold text-white mb-4">
              {editId ? "Edit Certification Details" : "Issue New Systems Certificate"}
            </h3>
            
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-nex-mist block uppercase">Registration ID</label>
                  <input type="text" required value={regId} onChange={(e) => setRegId(e.target.value)} className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-nex-mist block uppercase">Certificate ID</label>
                  <input type="text" required value={certId} onChange={(e) => setCertId(e.target.value)} className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-white" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-nex-mist block uppercase">Student Full Name</label>
                <input type="text" required value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="e.g. Niranjan M" className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-white" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-nex-mist block uppercase">Accredited Course Title</label>
                <input type="text" required value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} placeholder="e.g. Full Stack Web Development" className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-white" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-nex-mist block uppercase">Training Type</label>
                  <input type="text" value={trainingType} onChange={(e) => setTrainingType(e.target.value)} placeholder="e.g. Advanced Web Technologies" className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-nex-mist block uppercase">Internship Type</label>
                  <input type="text" value={internshipType} onChange={(e) => setInternshipType(e.target.value)} placeholder="e.g. Hybrid Model" className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-white" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-nex-mist block uppercase">Project Title</label>
                <input type="text" value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} placeholder="e.g. Realtime Glassmorphic Dashboard" className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-white" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-nex-mist block uppercase">Completion Date</label>
                  <input type="date" required value={completionDate} onChange={(e) => setCompletionDate(e.target.value)} className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-white text-[11px]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-nex-mist block uppercase">Student Phone</label>
                  <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="9876543210" className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-white" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-nex-mist block uppercase">Student Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@gmail.com" className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-white" />
              </div>

              <div className="flex gap-2 pt-2 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary !py-2 !px-4 text-xs">Cancel</button>
                <button type="submit" className="btn-primary !py-2 !px-6 text-xs bg-cyan-600 hover:bg-cyan-500 border-none shadow-[0_0_15px_rgba(6,182,212,0.3)]">Save Certificate</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
