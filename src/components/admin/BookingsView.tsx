import React, { useState } from "react";
import { Search, Calendar, User, Check, Trash2, Signature, Plus, DollarSign, Clock, FileText, CheckCircle2 } from "lucide-react";

interface BookingsViewProps {
  isDark: boolean;
  bookings: any[];
  saveTransaction: (action: string, payload: any) => Promise<any>;
  setSelectedSignatureBooking: (id: string) => void;
  setShowSignatureModal: (show: boolean) => void;
  crew?: string[];
}

export default function BookingsView({
  isDark,
  bookings,
  saveTransaction,
  setSelectedSignatureBooking,
  setShowSignatureModal,
  crew
}: BookingsViewProps) {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // Checklist Planner helper state inside this view
  const [activePlannerId, setActivePlannerId] = useState<string>("");
  const [newChecklistItem, setNewChecklistItem] = useState<string>("");

  // Add New Booking modal state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newBooking, setNewBooking] = useState<any>({
    name: "",
    email: "",
    phone: "",
    service: "Wedding Segment",
    date: new Date().toISOString().split("T")[0],
    price: 35000,
    advancePaid: 10000,
    photographer: "Unassigned",
    status: "confirmed",
    message: ""
  });

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBooking.name || !newBooking.email) {
      alert("Name and email are required.");
      return;
    }

    const createdId = "bk-" + Date.now();
    const balanceDue = Math.max(0, (Number(newBooking.price) || 0) - (Number(newBooking.advancePaid) || 0));

    await saveTransaction("update_booking", {
      id: createdId,
      ...newBooking,
      price: Number(newBooking.price) || 0,
      advancePaid: Number(newBooking.advancePaid) || 0,
      balanceDue,
      createdAt: new Date().toISOString()
    });

    setShowAddModal(false);
    setNewBooking({
      name: "",
      email: "",
      phone: "",
      service: "Wedding Segment",
      date: new Date().toISOString().split("T")[0],
      price: 35000,
      advancePaid: 10000,
      photographer: "Unassigned",
      status: "confirmed",
      message: ""
    });
  };

  const filtered = bookings.filter((b: any) => {
    const term = searchTerm.toLowerCase();
    const matchSearch = (b.name || "").toLowerCase().includes(term) ||
                        (b.service || "").toLowerCase().includes(term) ||
                        (b.id || "").toLowerCase().includes(term);
    if (filterStatus === "all") return matchSearch;
    return matchSearch && b.status === filterStatus;
  });

  const confirmedCount = bookings.filter(b => b.status === "confirmed").length;
  const pendingCount = bookings.filter(b => b.status === "pending").length;
  const totalAdvance = bookings.reduce((acc, curr) => acc + (curr.advancePaid || 0), 0);

  const handleToggleChecklistItem = (bId: string, idx: number) => {
    const b = bookings.find(x => x.id === bId);
    if (!b) return;
    let checklist = b.checklist || [];
    checklist = checklist.map((item: string, i: number) => {
      if (i === idx) {
        return item.startsWith("[x] ") ? item.substring(4) : `[x] ${item}`;
      }
      return item;
    });
    saveTransaction("update_booking", { id: bId, checklist });
  };

  const handleAddChecklistItem = (bId: string) => {
    if (!newChecklistItem.trim()) return;
    const b = bookings.find(x => x.id === bId);
    if (!b) return;
    const checklist = b.checklist || [];
    checklist.push(newChecklistItem.trim());
    saveTransaction("update_booking", { id: bId, checklist });
    setNewChecklistItem("");
  };

  const handleDeleteChecklistItem = (bId: string, idx: number) => {
    const b = bookings.find(x => x.id === bId);
    if (!b) return;
    const checklist = (b.checklist || []).filter((_: any, i: number) => i !== idx);
    saveTransaction("update_booking", { id: bId, checklist });
  };

  return (
    <div className="flex flex-col gap-6 text-slate-900 font-sans">
      
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Total Bookings</span>
            <span className="text-2xl font-black text-slate-900 font-display">{bookings.length}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
            <Calendar size={18} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Confirmed Shoots</span>
            <span className="text-2xl font-black text-emerald-600 font-display">{confirmedCount}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={18} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Pending Shoots</span>
            <span className="text-2xl font-black text-amber-600 font-display">{pendingCount}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
            <Clock size={18} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Advance Collected</span>
            <span className="text-2xl font-black text-[#b08d4b] font-display">₹{totalAdvance.toLocaleString()}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50/50 text-[#b08d4b]">
            <DollarSign size={18} />
          </div>
        </div>
      </div>

      {/* Header & Filter Controls */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {["all", "confirmed", "pending", "completed", "cancelled"].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
                filterStatus === st
                  ? "bg-[#b08d4b] text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search & Add Booking */}
        <div className="flex items-center gap-3">
          <div className="relative flex-grow sm:flex-grow-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search client or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-xs focus:outline-none focus:border-[#b08d4b] font-medium w-full sm:w-60"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#b08d4b] hover:bg-[#96753a] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-2 shrink-0"
          >
            <Plus size={14} /> New Booking
          </button>
        </div>
      </div>

      {/* Bookings List Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filtered.map(b => (
          <div key={b.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4 hover:shadow-md transition-all">
            
            {/* Card Header: Client Info & Status Selector */}
            <div className="flex justify-between items-start gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-mono font-bold text-[#b08d4b] uppercase">{b.id}</span>
                <h4 className="text-base font-extrabold text-slate-900 leading-tight">{b.name}</h4>
                <span className="text-xs text-slate-500 font-medium">{b.email} • {b.phone}</span>
              </div>

              <select
                value={b.status || "confirmed"}
                onChange={(e) => saveTransaction("update_booking", { id: b.id, status: e.target.value })}
                className={`text-xs font-bold font-mono uppercase px-3 py-1.5 rounded-lg border focus:outline-none cursor-pointer ${
                  b.status === "confirmed"
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                    : b.status === "pending"
                    ? "bg-amber-50 border-amber-300 text-amber-800"
                    : "bg-slate-100 border-slate-300 text-slate-800"
                }`}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Details Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs flex flex-col gap-2.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Service Package:</span>
                <span className="font-extrabold text-slate-900">{b.service}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Shoot Date:</span>
                <input
                  type="date"
                  value={b.date}
                  onChange={(e) => saveTransaction("update_booking", { id: b.id, date: e.target.value })}
                  className="bg-white border border-slate-200 px-2 py-1 rounded font-bold font-mono text-slate-900 focus:outline-none focus:border-[#b08d4b]"
                />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Lead Photographer:</span>
                <select
                  value={b.photographer || "Unassigned"}
                  onChange={(e) => saveTransaction("update_booking", { id: b.id, photographer: e.target.value })}
                  className="bg-white border border-slate-200 px-2 py-1 rounded font-bold text-slate-900 focus:outline-none"
                >
                  <option value="Unassigned">Unassigned</option>
                  {(crew || ["Ganesh SK", "Sunil K", "Rohit P"]).map((member) => (
                    <option key={member} value={member}>{member}</option>
                  ))}
                </select>
              </div>

              {/* Financial Math */}
              <div className="flex justify-between items-center border-t border-slate-200 pt-2 font-mono">
                <span className="text-slate-500 font-medium">Package Cost: <strong className="text-slate-900 font-bold">₹{(b.price || 0).toLocaleString()}</strong></span>
                <span className="text-slate-500 font-medium">Advance Paid: <strong className="text-emerald-700 font-bold">₹{(b.advancePaid || 0).toLocaleString()}</strong></span>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActivePlannerId(activePlannerId === b.id ? "" : b.id)}
                  className="text-xs font-bold text-[#b08d4b] hover:underline flex items-center gap-1"
                >
                  Checklists ({b.checklist?.length || 0})
                </button>

                <div className="flex items-center gap-1 text-xs font-medium">
                  {b.contractSigned ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 size={13} /> Contract Signed
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedSignatureBooking(b.id);
                        setShowSignatureModal(true);
                      }}
                      className="text-amber-600 font-bold hover:underline flex items-center gap-1"
                    >
                      <Signature size={13} /> Collect Signature
                    </button>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  if (confirm("Are you sure you want to archive this booking?")) {
                    saveTransaction("delete_booking", { id: b.id });
                  }
                }}
                className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                title="Archive Booking"
              >
                <Trash2 size={15} />
              </button>
            </div>

            {/* Checklist Planner Panel */}
            {activePlannerId === b.id && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-3">
                <span className="text-[10px] tracking-wider text-slate-500 uppercase font-mono font-bold">Shoot Day Tasks</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add task item..."
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    className="flex-grow px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#b08d4b]"
                  />
                  <button
                    onClick={() => handleAddChecklistItem(b.id)}
                    className="px-3 py-1.5 bg-[#b08d4b] text-white text-xs font-bold rounded-lg hover:bg-[#96753a]"
                  >
                    Add
                  </button>
                </div>
                
                <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {(b.checklist || []).map((item: string, idx: number) => {
                    const isChecked = item.startsWith("[x] ");
                    return (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <button
                          onClick={() => handleToggleChecklistItem(b.id, idx)}
                          className="flex items-center gap-2 text-left"
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            isChecked ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 bg-white"
                          }`}>
                            {isChecked && <Check size={10} />}
                          </div>
                          <span className={isChecked ? "line-through text-slate-400 font-medium" : "text-slate-800 font-medium"}>
                            {isChecked ? item.substring(4) : item}
                          </span>
                        </button>
                        <button 
                          onClick={() => handleDeleteChecklistItem(b.id, idx)}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 font-mono text-xs">
            No bookings found matching filters.
          </div>
        )}
      </div>

      {/* Add New Booking Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-[#b08d4b]">Create New Booking</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="flex flex-col gap-3.5 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono font-bold uppercase text-slate-500">Client Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={newBooking.name}
                  onChange={(e) => setNewBooking({ ...newBooking, name: e.target.value })}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#b08d4b] font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-500">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="client@gmail.com"
                    value={newBooking.email}
                    onChange={(e) => setNewBooking({ ...newBooking, email: e.target.value })}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#b08d4b] font-medium"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-500">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={newBooking.phone}
                    onChange={(e) => setNewBooking({ ...newBooking, phone: e.target.value })}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#b08d4b] font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-500">Service Category</label>
                  <select
                    value={newBooking.service}
                    onChange={(e) => setNewBooking({ ...newBooking, service: e.target.value })}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#b08d4b] font-medium"
                  >
                    <option value="Wedding Segment">Wedding Segment</option>
                    <option value="Pre-Wedding Shoot">Pre-Wedding Shoot</option>
                    <option value="Maternity Portfolio">Maternity Portfolio</option>
                    <option value="Newborn & Toddler Setup">Newborn & Toddler Setup</option>
                    <option value="Corporate & Event Shoots">Corporate & Event Shoots</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-500">Shoot Date</label>
                  <input
                    type="date"
                    value={newBooking.date}
                    onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#b08d4b] font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-500">Total Price (₹)</label>
                  <input
                    type="number"
                    value={newBooking.price}
                    onChange={(e) => setNewBooking({ ...newBooking, price: e.target.value })}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#b08d4b] font-medium"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-500">Advance Paid (₹)</label>
                  <input
                    type="number"
                    value={newBooking.advancePaid}
                    onChange={(e) => setNewBooking({ ...newBooking, advancePaid: e.target.value })}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#b08d4b] font-medium"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono font-bold uppercase text-slate-500">Assign Photographer</label>
                <select
                  value={newBooking.photographer}
                  onChange={(e) => setNewBooking({ ...newBooking, photographer: e.target.value })}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#b08d4b] font-medium"
                >
                  <option value="Unassigned">Unassigned</option>
                  {(crew || ["Ganesh SK", "Sunil K", "Rohit P"]).map((member) => (
                    <option key={member} value={member}>{member}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-bold uppercase tracking-wider text-[11px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#b08d4b] hover:bg-[#96753a] text-white rounded-xl font-bold uppercase tracking-wider text-[11px] shadow-sm"
                >
                  Create Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
