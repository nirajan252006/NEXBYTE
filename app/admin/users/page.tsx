"use client";

import React, { useEffect, useState } from "react";
import { UserCheck, Shield, Key, RefreshCw, Plus, Edit } from "lucide-react";
import { dbHelper } from "@/lib/dbHelper";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const list = await dbHelper.users.list();
      setUsers(list);
    } catch {
      alert("Failed to load admin users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    window.addEventListener("nexbyte-realtime", load);
    return () => window.removeEventListener("nexbyte-realtime", load);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-cyan-400" /> Admin Access Controls
          </h1>
          <p className="text-xs text-nex-mist mt-0.5">Manage console logins, roles permission matrices, and security keys.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <RefreshCw className="h-6 w-6 animate-spin text-cyan-400 mx-auto" />
          <p className="text-xs text-nex-mist mt-2">Connecting to authentication server...</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-2xl">
          {users.map((u) => (
            <div key={u.id} className="glass-card p-5 border-cyan-500/10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-xl flex items-center justify-center">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{u.full_name || u.fullName || "Admin Officer"}</h3>
                  <span className="text-[10px] text-nex-mist block mt-0.5">{u.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[8px] font-black uppercase bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded">
                  {u.role || "admin"}
                </span>
                <button className="btn-secondary !py-1.5 !px-3 text-[10px]">
                  <Key className="h-3.5 w-3.5" /> Reset Key
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
