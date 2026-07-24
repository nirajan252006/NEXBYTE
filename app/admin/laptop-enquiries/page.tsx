"use client";

import { useEffect, useState } from "react";
import {
  Laptop, Search, Filter, Phone, MessageCircle, Edit, Trash2, X, FileSpreadsheet, Save
} from "lucide-react";
import { dbHelper } from "@/lib/dbHelper";

const STATUS_OPTIONS = [
  { value: "new", label: "New", color: "text-nex-blueLight bg-nex-blue/10 border-nex-blue/20" },
  { value: "contacted", label: "Contacted", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
  { value: "quoted", label: "Quoted", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  { value: "sold", label: "Sold", color: "text-green-400 bg-green-500/10 border-green-500/20" },
  { value: "closed", label: "Closed", color: "text-white/50 bg-white/5 border-white/10" },
];

export default function AdminLaptopEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesText, setNotesText] = useState("");

  const load = async () => {
    const list = await dbHelper.laptopEnquiries.list();
    setEnquiries(list);
  };

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener("nexbyte-realtime", handler);
    return () => window.removeEventListener("nexbyte-realtime", handler);
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    await dbHelper.laptopEnquiries.update(id, { status: newStatus });
    load();
  };

  const handleSaveNotes = async (id: string) => {
    await dbHelper.laptopEnquiries.update(id, { admin_notes: notesText });
    setEditingNotes(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this laptop enquiry?")) {
      await dbHelper.laptopEnquiries.delete(id);
      load();
    }
  };

  const handleExportCSV = () => {
    let csv = "data:text/csv;charset=utf-8,Name,Phone,Email,Budget,Type,Message,Status,Admin Notes,Date\n";
    enquiries.forEach((e) => {
      csv += `"${e.customer_name}","${e.phone}","${e.email || ""}","${e.budget}","${e.laptop_type}","${(e.message || "").replace(/"/g, '""')}","${e.status}","${(e.admin_notes || "").replace(/"/g, '""')}","${e.created_at}"\n`;
    });
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", "NexByte_Laptop_Enquiries.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = enquiries.filter((e) => {
    const matchSearch = e.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      (e.phone || "").includes(search) ||
      (e.laptop_type || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Laptop Enquiries</h1>
          <p className="text-xs text-nex-mist mt-0.5">Track customer laptop purchase enquiries, budgets, preferences, and follow-up notes.</p>
        </div>
        <button onClick={handleExportCSV} className="btn-secondary !py-2.5 !px-4 text-xs flex items-center gap-1.5">
          <FileSpreadsheet className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-nex-ink flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-nex-mist" />
          <input type="text" placeholder="Search name, phone, or laptop type..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl bg-nex-black border border-white/[0.08] pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none" />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-nex-mist shrink-0" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-44 rounded-xl bg-nex-black border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none">
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-2xl">
          <Laptop className="h-10 w-10 text-nex-mist mx-auto mb-3" />
          <p className="text-xs text-white">No laptop enquiries found.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-white/5 bg-nex-ink overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-white border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.01] text-nex-mist font-semibold">
                  <th className="py-3 px-5">Customer</th>
                  <th className="py-3 px-4">Laptop Preferences</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Admin Notes</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => {
                  const statusCfg = STATUS_OPTIONS.find((s) => s.value === e.status) || STATUS_OPTIONS[0];
                  return (
                    <tr key={e.id} className="border-b border-white/[0.03] hover:bg-white/[0.01] transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-semibold text-white">{e.customer_name}</div>
                        <div className="text-[10px] text-nex-mist mt-0.5">{e.phone}</div>
                        {e.email && <div className="text-[9px] text-white/40 mt-0.5">{e.email}</div>}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-nex-blueLight">{e.laptop_type}</div>
                        <div className="text-[10px] text-nex-mist mt-0.5">Budget: <span className="text-white font-bold">₹{e.budget}</span></div>
                        <div className="text-[10px] text-white/60 mt-1 max-w-[200px] line-clamp-2">{e.message}</div>
                      </td>
                      <td className="py-4 px-4">
                        <select value={e.status} onChange={(ev) => handleStatusChange(e.id, ev.target.value)}
                          className={`rounded px-2.5 py-1 text-[10px] font-bold uppercase bg-nex-black border border-white/10 focus:outline-none ${statusCfg.color.split(" ")[0]}`}>
                          {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                        <div className="text-[9px] text-white/30 mt-1">{new Date(e.created_at).toLocaleDateString("en-IN")}</div>
                      </td>
                      <td className="py-4 px-4 max-w-[200px]">
                        {editingNotes === e.id ? (
                          <div className="flex items-center gap-1">
                            <input type="text" value={notesText} onChange={(ev) => setNotesText(ev.target.value)}
                              className="w-full rounded-lg bg-white/[0.05] border border-nex-blue/40 px-2 py-1 text-xs text-white focus:outline-none" autoFocus />
                            <button onClick={() => handleSaveNotes(e.id)} className="h-7 w-7 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
                              <Save className="h-3 w-3" />
                            </button>
                            <button onClick={() => setEditingNotes(null)} className="h-7 w-7 rounded-full bg-white/5 text-white/50 flex items-center justify-center">
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <span onClick={() => { setEditingNotes(e.id); setNotesText(e.admin_notes || ""); }}
                            className="text-[11px] text-nex-mist cursor-pointer hover:text-white transition-colors underline decoration-dotted">
                            {e.admin_notes || "Click to add notes..."}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right space-x-1.5">
                        <a href={`tel:${e.phone}`} className="h-8 w-8 rounded-full bg-green-500/10 hover:bg-green-500/20 flex items-center justify-center inline-flex text-green-400" title="Call">
                          <Phone className="h-3.5 w-3.5" />
                        </a>
                        <a href={`https://wa.me/${(e.phone || "").replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                          className="h-8 w-8 rounded-full bg-[#25D366]/10 hover:bg-[#25D366]/20 flex items-center justify-center inline-flex text-[#25D366]" title="WhatsApp">
                          <MessageCircle className="h-3.5 w-3.5" />
                        </a>
                        <button onClick={() => handleDelete(e.id)}
                          className="h-8 w-8 rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center inline-flex text-red-400" title="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
