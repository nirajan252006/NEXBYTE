"use client";

import { useEffect, useState } from "react";
import { User, Mail, Phone, Building2, MapPin, Loader2, Save, CheckCircle } from "lucide-react";

export default function ResellerProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cookies = document.cookie.split(";").reduce((acc: Record<string, string>, c) => {
        const [k, v] = c.trim().split("=");
        if (k) acc[k] = decodeURIComponent(v || "");
        return acc;
      }, {});
      setName(cookies["nexbyte_reseller_name"] || "");
      setEmail(cookies["nexbyte_reseller_email"] || "");
      setBusinessName(cookies["nexbyte_reseller_name"] || "");
    }
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // In production, this would call an API route to update the profile in DB
    await new Promise(r => setTimeout(r, 800));
    document.cookie = `nexbyte_reseller_name=${encodeURIComponent(businessName || name)}; path=/`;
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2500);
  };

  const inputCls = "w-full rounded-xl bg-white/[0.03] border border-white/10 px-3.5 py-2.5 text-xs text-white focus:border-nex-blue/40 focus:outline-none transition-colors";

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">My Profile</h1>
        <p className="text-xs text-nex-mist mt-0.5">Manage your reseller profile and business information.</p>
      </div>

      <form onSubmit={handleSave} className="glass-panel p-6 rounded-2xl border border-white/5 bg-nex-ink space-y-4">
        {saved && (
          <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-xs text-green-400 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" /> Profile updated successfully.
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-semibold text-white/80 block mb-1 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-purple-400" /> Business Name
            </label>
            <input value={businessName} onChange={e => setBusinessName(e.target.value)}
              placeholder="Your business name" className={inputCls} />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-white/80 block mb-1 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-nex-blueLight" /> Owner Name
            </label>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="Your name" className={inputCls} />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-white/80 block mb-1 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-nex-blueLight" /> Email
            </label>
            <input type="email" value={email} readOnly
              className={inputCls + " opacity-60 cursor-not-allowed"} />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-white/80 block mb-1 flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-nex-blueLight" /> Phone
            </label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="9876543210" className={inputCls} />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-white/80 block mb-1 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-nex-blueLight" /> City
            </label>
            <input value={city} onChange={e => setCity(e.target.value)}
              placeholder="Bengaluru" className={inputCls} />
          </div>
        </div>
        <div>
          <label className="text-[11px] font-semibold text-white/80 block mb-1">Business Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
            placeholder="Brief description of your business..." className={inputCls + " resize-none"} />
        </div>
        <div className="flex justify-end pt-2">
          <button type="submit" disabled={saving}
            className="btn-primary !py-2.5 !px-5 text-xs font-bold flex items-center gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
}
