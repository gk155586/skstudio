"use client";

import React, { useState } from "react";
import { 
  Plus, Search, Phone, Mail, Calendar, DollarSign, CheckCircle2, 
  Trash2, ArrowRight, User, Filter, X, MessageSquare, ExternalLink
} from "lucide-react";

interface EnquiriesViewProps {
  isDark?: boolean;
  enquiries: any[];
  saveTransaction: (action: string, payload: any) => Promise<any>;
  crew?: string[];
}

export default function EnquiriesView({
  enquiries,
  saveTransaction,
  crew
}: EnquiriesViewProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeEnquiry, setActiveEnquiry] = useState<any | null>(null);
  
  // Add Lead Modal state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newLead, setNewLead] = useState<any>({
    name: "",
    email: "",
    phone: "",
    service: "Wedding Segment",
    budget: 25000,
    message: "",
    status: "New"
  });

  // Convert to Booking modal state
  const [showConvertModal, setShowConvertModal] = useState<boolean>(false);
  const [convertData, setConvertData] = useState<any>({
    price: 25000,
    advancePaid: 5000,
    date: new Date().toISOString().split("T")[0],
    photographer: "Ganesh SK"
  });

  // Note state inside active enquiry modal
  const [newNoteText, setNewNoteText] = useState<string>("");

  const filteredEnquiries = enquiries.filter((enq: any) => {
    const term = searchTerm.toLowerCase();
    const name = (enq.name || enq.customerName || "").toLowerCase();
    const email = (enq.email || enq.customerEmail || "").toLowerCase();
    const phone = (enq.phone || enq.customerPhone || "").toLowerCase();
    const service = (enq.service || enq.frameName || "").toLowerCase();

    const matchesSearch = name.includes(term) || email.includes(term) || phone.includes(term) || service.includes(term);
    
    if (statusFilter === "all") return matchesSearch;
    const s = enq.status || "New";
    return matchesSearch && (s === statusFilter);
  });

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.name || !newLead.email) {
      alert("Name and Email are required.");
      return;
    }

    await saveTransaction("update_enquiry", {
      id: "enq-" + Date.now(),
      ...newLead,
      createdAt: new Date().toISOString()
    });

    setShowAddModal(false);
    setNewLead({
      name: "",
      email: "",
      phone: "",
      service: "Wedding Segment",
      budget: 25000,
      message: "",
      status: "New"
    });
  };

  const handleConvertConfirm = async () => {
    if (!activeEnquiry) return;
    const result = await saveTransaction("convert_enquiry", {
      enquiryId: activeEnquiry.id,
      price: Number(convertData.price) || 0,
      advancePaid: Number(convertData.advancePaid) || 0,
      date: convertData.date || new Date().toISOString().split("T")[0],
      photographer: convertData.photographer || "Ganesh SK"
    });

    if (result && result.success) {
      setShowConvertModal(false);
      setActiveEnquiry(null);
      alert("Lead successfully converted to confirmed booking!");
    }
  };

  const handleAddNote = (id: string) => {
    if (!newNoteText.trim()) return;
    const enq = enquiries.find(e => e.id === id);
    if (!enq) return;
    const notes = enq.notes || [];
    notes.push({ text: newNoteText.trim(), timestamp: new Date().toISOString() });
    saveTransaction("update_enquiry", { id, notes });
    setNewNoteText("");
    setActiveEnquiry({ ...enq, notes });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "New":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "Contacted":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "Converted":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "Lost":
        return "bg-rose-100 text-rose-800 border-rose-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Search, Status Filters & Add Action */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {["all", "New", "Contacted", "Converted", "Lost"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all uppercase whitespace-nowrap border ${
                statusFilter === st
                  ? "bg-[#b08d4b] text-white border-[#b08d4b] shadow-sm"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {st === "all" ? `All (${enquiries.length})` : st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-grow md:w-64">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search enquiries by name, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#b08d4b] focus:bg-white transition-all"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#b08d4b] hover:bg-[#96753a] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm transition-all shrink-0"
          >
            <Plus size={15} /> Add Lead
          </button>
        </div>
      </div>

      {/* Simplified Clean Table View */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                <th className="py-4 px-6">Client Name</th>
                <th className="py-4 px-4">Contact Info</th>
                <th className="py-4 px-4">Service</th>
                <th className="py-4 px-4">Budget</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-sans">
              {filteredEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-mono text-xs">
                    No enquiries found. Click "+ Add Lead" to create one.
                  </td>
                </tr>
              ) : (
                filteredEnquiries.map((enq) => {
                  const name = enq.name || enq.customerName || "Anonymous";
                  const email = enq.email || enq.customerEmail || "No email";
                  const phone = enq.phone || enq.customerPhone || "No phone";
                  const service = enq.service || (enq.frameName ? `Frame: ${enq.frameName}` : "General Enquiry");
                  const budget = enq.budget || enq.price || 0;
                  const status = enq.status || "New";

                  return (
                    <tr key={enq.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name */}
                      <td className="py-4 px-6 font-semibold text-slate-900">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900">{name}</span>
                          <span className="text-[10px] font-mono text-slate-400">{enq.id}</span>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1 text-slate-600">
                          <span className="flex items-center gap-1.5 text-slate-700">
                            <Mail size={12} className="text-slate-400" /> {email}
                          </span>
                          <span className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                            <Phone size={12} className="text-slate-400" /> {phone}
                          </span>
                        </div>
                      </td>

                      {/* Service */}
                      <td className="py-4 px-4 font-medium text-slate-800">
                        <span className="inline-block bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 text-xs">
                          {service}
                        </span>
                      </td>

                      {/* Budget */}
                      <td className="py-4 px-4 font-semibold text-[#b08d4b] font-mono text-sm">
                        ₹{Number(budget).toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <select
                          value={status}
                          onChange={(e) => saveTransaction("update_enquiry", { id: enq.id, status: e.target.value })}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-xl border focus:outline-none cursor-pointer ${getStatusBadgeClass(status)}`}
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Converted">Converted</option>
                          <option value="Lost">Lost</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setActiveEnquiry(enq)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-all"
                            title="View Details & Notes"
                          >
                            Details
                          </button>

                          {status !== "Converted" && (
                            <button
                              onClick={() => {
                                setActiveEnquiry(enq);
                                setConvertData({
                                  price: budget || 25000,
                                  advancePaid: 5000,
                                  date: new Date().toISOString().split("T")[0],
                                  photographer: "Ganesh SK"
                                });
                                setShowConvertModal(true);
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1 transition-all"
                            >
                              Convert <ArrowRight size={13} />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (confirm(`Delete enquiry for ${name}?`)) {
                                saveTransaction("delete_enquiry", { id: enq.id });
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Delete Enquiry"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider font-display">Add New Lead / Enquiry</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="flex flex-col gap-3.5 text-xs text-slate-700">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase">Client Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikramaditya Pune"
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#b08d4b] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="client@gmail.com"
                    value={newLead.email}
                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#b08d4b] focus:bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#b08d4b] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Service Required</label>
                  <select
                    value={newLead.service}
                    onChange={(e) => setNewLead({ ...newLead, service: e.target.value })}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#b08d4b] focus:bg-white"
                  >
                    <option value="Wedding Segment">Wedding Segment</option>
                    <option value="Pre-Wedding Shoot">Pre-Wedding Shoot</option>
                    <option value="Newborn & Toddler Setup">Newborn & Toddler Setup</option>
                    <option value="Maternity Portfolio">Maternity Portfolio</option>
                    <option value="Cinematic Reel Shoot">Cinematic Reel Shoot</option>
                    <option value="Corporate Event">Corporate Event</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Estimated Budget (₹)</label>
                  <input
                    type="number"
                    value={newLead.budget}
                    onChange={(e) => setNewLead({ ...newLead, budget: e.target.value })}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#b08d4b] focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase">Message / Notes</label>
                <textarea
                  rows={3}
                  placeholder="Enquiry details or custom requirements..."
                  value={newLead.message}
                  onChange={(e) => setNewLead({ ...newLead, message: e.target.value })}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#b08d4b] focus:bg-white"
                />
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs text-slate-500 hover:text-slate-700 font-bold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#b08d4b] hover:bg-[#96753a] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enquiry Details & Notes Drawer / Modal */}
      {activeEnquiry && !showConvertModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">{activeEnquiry.name || activeEnquiry.customerName}</h3>
                <span className="text-[10px] font-mono text-slate-400">{activeEnquiry.id}</span>
              </div>
              <button onClick={() => setActiveEnquiry(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Email:</span>
                  <p className="font-medium text-slate-800">{activeEnquiry.email || activeEnquiry.customerEmail || "N/A"}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Phone:</span>
                  <p className="font-medium text-slate-800">{activeEnquiry.phone || activeEnquiry.customerPhone || "N/A"}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Service:</span>
                  <p className="font-medium text-slate-800">{activeEnquiry.service || activeEnquiry.frameName || "General"}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Budget:</span>
                  <p className="font-bold text-[#b08d4b]">₹{(activeEnquiry.budget || activeEnquiry.price || 0).toLocaleString()}</p>
                </div>
              </div>

              {activeEnquiry.message && (
                <div className="bg-amber-50/60 border border-amber-200/60 p-3 rounded-xl">
                  <span className="text-[10px] font-bold uppercase text-amber-800">Message from Client:</span>
                  <p className="mt-1 text-slate-700 leading-relaxed">{activeEnquiry.message}</p>
                </div>
              )}

              {/* Notes Timeline */}
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold uppercase text-slate-600">Activity & Follow-up Notes</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add follow-up note..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    className="flex-grow px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#b08d4b]"
                  />
                  <button
                    onClick={() => handleAddNote(activeEnquiry.id)}
                    className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 text-xs"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-col gap-2 max-h-40 overflow-y-auto mt-2 pr-1">
                  {(activeEnquiry.notes || []).map((n: any, idx: number) => (
                    <div key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs flex flex-col gap-0.5">
                      <p className="text-slate-800">{n.text}</p>
                      <span className="text-[9px] font-mono text-slate-400">
                        {new Date(n.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  {(!activeEnquiry.notes || activeEnquiry.notes.length === 0) && (
                    <p className="text-slate-400 text-center py-3 text-xs italic font-mono">No notes logged yet.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  if (confirm("Delete this enquiry?")) {
                    saveTransaction("delete_enquiry", { id: activeEnquiry.id });
                    setActiveEnquiry(null);
                  }
                }}
                className="text-xs text-rose-600 font-bold hover:underline"
              >
                Delete Enquiry
              </button>

              <button
                onClick={() => {
                  setConvertData({
                    price: activeEnquiry.budget || 25000,
                    advancePaid: 5000,
                    date: new Date().toISOString().split("T")[0],
                    photographer: "Ganesh SK"
                  });
                  setShowConvertModal(true);
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm flex items-center gap-1.5"
              >
                Convert to Booking <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Convert to Booking Modal */}
      {showConvertModal && activeEnquiry && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider font-display text-emerald-600">Convert Lead to Booking</h3>
              <button onClick={() => setShowConvertModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Converting lead for <strong className="text-slate-900">{activeEnquiry.name || activeEnquiry.customerName}</strong> into an active booking:
            </p>

            <div className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase">Final Agreed Package Price (₹)</label>
                <input
                  type="number"
                  value={convertData.price}
                  onChange={(e) => setConvertData({ ...convertData, price: e.target.value })}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase">Advance Amount Received (₹)</label>
                <input
                  type="number"
                  value={convertData.advancePaid}
                  onChange={(e) => setConvertData({ ...convertData, advancePaid: e.target.value })}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase">Shoot Date</label>
                <input
                  type="date"
                  value={convertData.date}
                  onChange={(e) => setConvertData({ ...convertData, date: e.target.value })}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase">Assigned Photographer</label>
                <select
                  value={convertData.photographer}
                  onChange={(e) => setConvertData({ ...convertData, photographer: e.target.value })}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                >
                  {(crew || ["Ganesh SK", "Sunil K", "Rohit P"]).map((member) => (
                    <option key={member} value={member}>{member}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowConvertModal(false)}
                className="px-4 py-2 text-xs text-slate-500 hover:text-slate-700 font-bold uppercase"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConvertConfirm}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md"
              >
                Confirm Conversion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
