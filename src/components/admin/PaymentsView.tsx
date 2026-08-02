"use client";

import React, { useState, useEffect } from "react";
import { DollarSign, Printer, X, Sparkles, CheckCircle2, Plus, Trash2, FileText, Download, Search, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";

interface PaymentsViewProps {
  isDark?: boolean;
  bookings: any[];
  coupons: any[];
  saveTransaction: (action: string, payload: any) => Promise<any>;
}

const SERVICE_OPTIONS = [
  "Wedding Segment",
  "Pre-Wedding Shoot",
  "Maternity Portfolio",
  "Newborn & Toddler Setup",
  "Portrait Shoot",
  "Product Shoot",
  "Corporate & Event Shoots",
  "Custom Package"
];

export default function PaymentsView({
  bookings,
  coupons,
  saveTransaction
}: PaymentsViewProps) {
  // Builder Input state
  const [invoiceClientName, setInvoiceClientName] = useState<string>("Client Name");
  const [invoiceClientPhone, setInvoiceClientPhone] = useState<string>("+91 93071 12119");
  const [invoiceClientEmail, setInvoiceClientEmail] = useState<string>("client@example.com");
  const [invoiceClientAddress, setInvoiceClientAddress] = useState<string>("Pune, Maharashtra");
  const [customerState, setCustomerState] = useState<string>("MH"); // MH = Maharashtra

  const [invoiceService, setInvoiceService] = useState<string>("Wedding Segment");
  const [invoicePrice, setInvoicePrice] = useState<number>(35000);
  const [invoiceDiscount, setInvoiceDiscount] = useState<number>(0);
  const [invoiceAdvance, setInvoiceAdvance] = useState<number>(10000);
  const [activePromoCode, setActivePromoCode] = useState<string>("");
  const [gstEnabled, setGstEnabled] = useState<boolean>(true);
  const [gstRate, setGstRate] = useState<number>(18);

  // Financial Records Filters & Accordion State
  const [recordSearch, setRecordSearch] = useState<string>("");
  const [recordStatusFilter, setRecordStatusFilter] = useState<string>("all");
  const [expandedRecordIds, setExpandedRecordIds] = useState<Record<string, boolean>>({});

  const toggleRecordExpand = (id: string) => {
    setExpandedRecordIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getRecordStatusBadge = (b: any) => {
    const price = Number(b.price) || 0;
    const balance = Number(b.balanceDue) || 0;
    const advance = Number(b.advancePaid) || 0;

    if (price === 0) {
      return { label: "Incomplete", color: "bg-amber-100 text-amber-800 border-amber-300" };
    }
    if (balance === 0) {
      return { label: "Paid", color: "bg-emerald-100 text-emerald-800 border-emerald-300" };
    }
    if (advance > 0 && balance > 0) {
      return { label: "Partial", color: "bg-amber-100 text-amber-800 border-amber-300" };
    }
    return { label: "Pending", color: "bg-rose-100 text-rose-800 border-rose-300" };
  };

  const filteredRecords = bookings.filter((b) => {
    const term = recordSearch.toLowerCase();
    const matchSearch =
      (b.name || "").toLowerCase().includes(term) ||
      (b.service || "").toLowerCase().includes(term) ||
      (b.id || "").toLowerCase().includes(term) ||
      (b.phone || "").toLowerCase().includes(term);

    const price = Number(b.price) || 0;
    const balance = Number(b.balanceDue) || 0;
    const advance = Number(b.advancePaid) || 0;

    let statusKey = "pending";
    if (price === 0) statusKey = "incomplete";
    else if (balance === 0) statusKey = "paid";
    else if (advance > 0) statusKey = "partial";

    if (recordStatusFilter === "all") return matchSearch;
    if (recordStatusFilter === "paid") return matchSearch && statusKey === "paid";
    if (recordStatusFilter === "partial") return matchSearch && statusKey === "partial";
    if (recordStatusFilter === "pending") return matchSearch && (statusKey === "pending" || statusKey === "incomplete");
    return matchSearch;
  });

  // Modal Mouse Wheel Scroll Management
  const [showInvoiceModal, setShowInvoiceModal] = useState<boolean>(false);

  useEffect(() => {
    if (showInvoiceModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showInvoiceModal]);

  // Line Items
  const [lineItems, setLineItems] = useState<any[]>([
    { description: "Photography Shoot Package", rate: 35000, qty: 1 }
  ]);

  // Modal Control
  const [invoiceNumber, setInvoiceNumber] = useState<string>("");
  const [invoiceDate, setInvoiceDate] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");

  // Bank & Terms
  const [studioUpiId, setStudioUpiId] = useState<string>("9307112119@ybl");
  const [terms, setTerms] = useState<string[]>([
    "Please collect data within 7 days.",
    "Late payments will not be accepted.",
    "Package rates are fixed and non-negotiable."
  ]);

  // Math calculation
  let discAmt = invoiceDiscount;
  if (activePromoCode.trim()) {
    const matchCoupon = coupons.find(c => c.code === activePromoCode.trim().toUpperCase() && c.isActive);
    if (matchCoupon) {
      discAmt = matchCoupon.type === "percentage" 
        ? (invoicePrice * matchCoupon.value) / 100 
        : matchCoupon.value;
    }
  }

  const itemsTotal = lineItems.reduce((sum, item) => sum + ((Number(item.rate) || 0) * (Number(item.qty) || 1)), 0);
  const subtotal = Math.max(0, (itemsTotal || invoicePrice) - discAmt);
  let tax = 0;
  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (gstEnabled) {
    tax = (subtotal * gstRate) / 100;
    if (customerState === "MH") {
      cgst = tax / 2;
      sgst = tax / 2;
    } else {
      igst = tax;
    }
  }

  const grandTotal = Math.round(subtotal + tax);
  const balanceDue = Math.max(0, grandTotal - invoiceAdvance);

  const handleGenerateInvoice = () => {
    setInvoiceNumber("INV-" + Date.now().toString().slice(-6));
    setInvoiceDate(new Date().toLocaleDateString("en-IN"));
    const future = new Date();
    future.setDate(future.getDate() + 7);
    setDueDate(future.toLocaleDateString("en-IN"));
    setShowInvoiceModal(true);
  };

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { description: "Additional Photography Service", rate: 5000, qty: 1 }]);
  };

  const handleUpdateLineItem = (idx: number, key: string, val: any) => {
    const copy = [...lineItems];
    copy[idx] = { ...copy[idx], [key]: val };
    setLineItems(copy);
  };

  const handleDeleteLineItem = (idx: number) => {
    setLineItems(lineItems.filter((_, i) => i !== idx));
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Top Section: Quick Invoice Builder & Revenue Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 1 Col: Quick Builder Inputs */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-display flex items-center gap-2">
              <FileText size={16} className="text-[#b08d4b]" /> Invoice Generator
            </h3>
            <span className="text-[10px] font-mono font-bold bg-[#b08d4b]/15 text-[#b08d4b] px-2 py-0.5 rounded-full">
              GST READY
            </span>
          </div>

          <div className="flex flex-col gap-3 text-xs text-slate-700">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase">Client Name</label>
              <input
                type="text"
                value={invoiceClientName}
                onChange={(e) => setInvoiceClientName(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#b08d4b] focus:bg-white font-medium"
              />
            </div>

            {/* Service Package Dropdown */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase">Service Package</label>
              <select
                value={SERVICE_OPTIONS.includes(invoiceService) ? invoiceService : "Custom Package"}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val !== "Custom Package") {
                    setInvoiceService(val);
                  } else {
                    setInvoiceService("Custom Service");
                  }
                }}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#b08d4b] focus:bg-white font-medium cursor-pointer"
              >
                {SERVICE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>

              {(!SERVICE_OPTIONS.includes(invoiceService) || invoiceService === "Custom Service") && (
                <input
                  type="text"
                  placeholder="Enter Custom Service Name"
                  value={invoiceService}
                  onChange={(e) => setInvoiceService(e.target.value)}
                  className="mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#b08d4b] focus:bg-white font-medium text-xs"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase">Phone</label>
                <input
                  type="text"
                  value={invoiceClientPhone}
                  onChange={(e) => setInvoiceClientPhone(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#b08d4b] focus:bg-white font-medium"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase">Email</label>
                <input
                  type="email"
                  value={invoiceClientEmail}
                  onChange={(e) => setInvoiceClientEmail(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#b08d4b] focus:bg-white font-medium"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase">Client Address</label>
              <input
                type="text"
                value={invoiceClientAddress}
                onChange={(e) => setInvoiceClientAddress(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#b08d4b] focus:bg-white font-medium"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase">Place of Supply / State Code</label>
              <select
                value={customerState}
                onChange={(e) => setCustomerState(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#b08d4b] font-medium"
              >
                <option value="MH">Maharashtra (CGST 9% + SGST 9%)</option>
                <option value="OS">Out of State (IGST 18%)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase">Advance Paid (₹)</label>
                <input
                  type="number"
                  value={invoiceAdvance}
                  onChange={(e) => setInvoiceAdvance(Number(e.target.value) || 0)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#b08d4b] font-mono font-bold"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase">Promo Code</label>
                <input
                  type="text"
                  placeholder="WELCOME10"
                  value={activePromoCode}
                  onChange={(e) => setActivePromoCode(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#b08d4b] font-mono uppercase"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-bold text-slate-700">Include GST Tax (18%)</span>
              <button
                onClick={() => setGstEnabled(!gstEnabled)}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors ${gstEnabled ? "bg-[#b08d4b]" : "bg-slate-300"}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${gstEnabled ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>

            <button
              onClick={handleGenerateInvoice}
              className="mt-2 w-full py-3 bg-[#b08d4b] hover:bg-[#96753a] text-white font-bold uppercase tracking-wider text-xs rounded-xl shadow-sm transition-all"
            >
              Generate Printable Invoice
            </button>
          </div>
        </div>

        {/* Right 2 Cols: Transaction & Invoice History List */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
          
          {/* Header & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-display">Financial Transactions & Records</h3>
              <span className="text-xs text-slate-500 font-mono">({filteredRecords.length}/{bookings.length})</span>
            </div>

            {/* Search & Status Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search records..."
                  value={recordSearch}
                  onChange={(e) => setRecordSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-lg text-xs focus:outline-none focus:border-[#b08d4b] font-medium w-36 sm:w-44"
                />
              </div>

              <select
                value={recordStatusFilter}
                onChange={(e) => setRecordStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-[#b08d4b]"
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="pending">Pending / Overdue</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-3 max-h-[520px] overflow-y-auto pr-1">
            {filteredRecords.map((b) => {
              const isExpanded = !!expandedRecordIds[b.id];
              const badge = getRecordStatusBadge(b);
              const isZeroValue = (Number(b.price) || 0) === 0;

              return (
                <div key={b.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-xs flex flex-col gap-3 transition-all">
                  
                  {/* Collapsed Summary Header (Always Visible) */}
                  <div className="flex items-center justify-between gap-3 cursor-pointer select-none" onClick={() => toggleRecordExpand(b.id)}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase border ${badge.color}`}>
                        {badge.label}
                      </span>

                      <span className="font-mono font-bold text-[#b08d4b]">{b.id}</span>
                      <span className="font-extrabold text-slate-900 text-sm">{b.name}</span>

                      {/* Zero-Value Warning Flag */}
                      {isZeroValue && (
                        <span className="flex items-center gap-1 text-[10px] font-bold font-mono bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full" title="Booking price is ₹0. Please update pricing details.">
                          <AlertTriangle size={12} className="text-amber-600 shrink-0" /> Pricing Incomplete
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="hidden sm:flex flex-col text-right">
                        <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Service:</span>
                        <span className="font-semibold text-slate-800 truncate max-w-[140px]">{b.service || "Wedding Segment"}</span>
                      </div>

                      <div className="flex flex-col text-right">
                        <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Balance:</span>
                        <span className={`font-mono font-extrabold text-xs ${isZeroValue ? "text-amber-600" : (b.balanceDue || 0) === 0 ? "text-emerald-600" : "text-rose-600"}`}>
                          ₹{(b.balanceDue || 0).toLocaleString()}
                        </span>
                      </div>

                      <button className="p-1 text-slate-400 hover:text-slate-700">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details Body */}
                  {isExpanded && (
                    <div className="flex flex-col gap-3 pt-3 border-t border-slate-200/80">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-lg border border-slate-200 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">Full Service:</span>
                          <p className="font-bold text-slate-900 mt-0.5">{b.service || "Wedding Segment"}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">Total Package:</span>
                          <p className="font-bold text-slate-900 font-mono mt-0.5">₹{(b.price || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">Advance Paid:</span>
                          <p className="font-bold text-emerald-600 font-mono mt-0.5">₹{(b.advancePaid || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">Balance Due:</span>
                          <p className="font-bold text-rose-600 font-mono mt-0.5">₹{(b.balanceDue || 0).toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 font-medium">
                        <span>Contact: {b.phone || "No phone"} • {b.email || "No email"}</span>
                        <span>Date Created: {new Date(b.createdAt || Date.now()).toLocaleDateString("en-IN")}</span>
                      </div>

                      <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setInvoiceClientName(b.name || "Client");
                            setInvoiceClientPhone(b.phone || "");
                            setInvoiceClientEmail(b.email || "");
                            setInvoicePrice(b.price || 25000);
                            setInvoiceAdvance(b.advancePaid || 5000);
                            const svc = b.service || "Wedding Segment";
                            setInvoiceService(svc);
                            setLineItems([{ description: svc + " Services", rate: b.price || 25000, qty: 1 }]);
                            handleGenerateInvoice();
                          }}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <Printer size={13} /> Print Invoice
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}

            {filteredRecords.length === 0 && (
              <div className="text-center text-slate-400 text-xs py-12 font-mono">No matching financial records found.</div>
            )}
          </div>
        </div>
      </div>

      {/* High-Contrast, Perfectly Readable Printable Invoice Modal */}
      {showInvoiceModal && (
        <div className="printable-invoice-backdrop fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[9999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="printable-invoice-sheet w-full max-w-4xl bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 p-6 md:p-8 relative flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Controls (Hidden in Print) */}
            <div className="flex justify-between items-center border-b border-slate-200 pb-4 print-hidden">
              <span className="text-xs font-bold uppercase tracking-wider text-[#b08d4b] font-mono">
                Tax Invoice Preview & Print
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2 bg-[#b08d4b] hover:bg-[#96753a] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm flex items-center gap-2 transition-all"
                >
                  <Printer size={14} /> Print / Save PDF
                </button>
                <button onClick={() => setShowInvoiceModal(false)} className="text-slate-400 hover:text-slate-700">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Printable Invoice Sheet */}
            <div className="flex flex-col gap-3.5 print:gap-3 text-slate-900">
              
              {/* Header: Studio Brand & Invoice Meta */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-3">
                    <img
                      src="/img/logo-light.png"
                      alt="SK Studio Pune Official Logo"
                      className="h-10 w-auto object-contain logo-blend shrink-0"
                    />
                    <h1 className="text-xl font-black tracking-tight text-slate-900 font-display uppercase">
                      SK PHOTO STUDIO PUNE
                    </h1>
                  </div>
                  
                  <div className="text-xs text-slate-700 font-medium leading-normal flex flex-col gap-0.5 mt-0.5">
                    <p className="font-semibold text-slate-900">
                      Address: Sakubai Gawali Gardan, Shriram Colony, Bhosari, Maharashtra - 411039, India
                    </p>
                    <p>
                      Phone: +91 93071 12119 • Email: skstudiopune@gmail.com
                    </p>
                    <p className="font-mono font-bold text-slate-900 text-[11px]">
                      GSTIN: 27AASKS7777D1Z9
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end text-right">
                  <span className="text-xl font-black text-[#b08d4b] tracking-wider uppercase font-mono">
                    TAX INVOICE
                  </span>
                  <div className="mt-1.5 text-xs font-mono flex flex-col gap-0.5 text-slate-700">
                    <div><span className="text-slate-500 font-bold uppercase">Invoice No:</span> <strong className="text-slate-900 font-bold">{invoiceNumber}</strong></div>
                    <div><span className="text-slate-500 font-bold uppercase">Date:</span> <strong className="text-slate-900">{invoiceDate}</strong></div>
                    <div><span className="text-slate-500 font-bold uppercase">Due Date:</span> <strong className="text-slate-900">{dueDate}</strong></div>
                  </div>
                </div>
              </div>

              {/* Bill To Customer Details */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase font-mono tracking-wider">BILLED TO:</span>
                  <p className="text-xs font-extrabold text-slate-900">{invoiceClientName}</p>
                  <p className="text-slate-700 font-medium text-[11px]">{invoiceClientAddress}</p>
                  <p className="text-slate-700 font-medium text-[11px]">Phone: {invoiceClientPhone} • Email: {invoiceClientEmail}</p>
                </div>
              </div>

              {/* Editable Itemized Services Table */}
              <div className="flex flex-col gap-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white text-[10px] font-bold uppercase font-mono tracking-wider">
                      <th className="py-2 px-3">Service Description</th>
                      <th className="py-2 px-3 text-center w-16">Qty</th>
                      <th className="py-2 px-3 text-right w-24">Rate (₹)</th>
                      <th className="py-2 px-3 text-right w-28">Amount (₹)</th>
                      <th className="py-2 px-1 w-8 print:hidden print-hidden"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-[11px] font-medium text-slate-800">
                    {lineItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-1.5 px-3">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleUpdateLineItem(idx, "description", e.target.value)}
                            className="w-full bg-transparent border-none font-bold text-slate-900 focus:bg-slate-100 focus:outline-none"
                          />
                        </td>
                        <td className="py-1.5 px-3 text-center">
                          <input
                            type="number"
                            value={item.qty}
                            onChange={(e) => handleUpdateLineItem(idx, "qty", parseInt(e.target.value) || 1)}
                            className="w-full bg-transparent border-none text-center font-semibold text-slate-900 focus:bg-slate-100 focus:outline-none"
                          />
                        </td>
                        <td className="py-1.5 px-3 text-right">
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => handleUpdateLineItem(idx, "rate", parseFloat(e.target.value) || 0)}
                            className="w-full bg-transparent border-none text-right font-semibold text-slate-900 focus:bg-slate-100 focus:outline-none"
                          />
                        </td>
                        <td className="py-1.5 px-3 text-right font-extrabold text-slate-900 font-mono text-xs">
                          ₹{((item.rate || 0) * (item.qty || 1)).toLocaleString()}
                        </td>
                        <td className="py-1.5 px-1 text-center print:hidden print-hidden">
                          <button onClick={() => handleDeleteLineItem(idx)} className="text-slate-400 hover:text-rose-600">
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <button
                  onClick={handleAddLineItem}
                  className="self-start text-[10px] font-bold text-[#b08d4b] hover:underline flex items-center gap-1 mt-0.5 print:hidden print-hidden"
                >
                  <Plus size={11} /> Add Line Item
                </button>
              </div>

              {/* Math Calculations Breakdown - Compact & Small */}
              <div className="flex justify-end pt-2 border-t border-slate-200">
                <div className="w-56 flex flex-col gap-1 text-[10px] font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span>Itemized Total:</span>
                    <span className="font-bold text-slate-900">₹{(itemsTotal || invoicePrice).toLocaleString()}</span>
                  </div>

                  {discAmt > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Discount:</span>
                      <span>- ₹{discAmt.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-700 font-bold border-t border-slate-200 pt-1">
                    <span>Taxable Subtotal:</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>

                  {gstEnabled && (
                    <>
                      {customerState === "MH" ? (
                        <>
                          <div className="flex justify-between text-slate-600">
                            <span>CGST (9%):</span>
                            <span>₹{cgst.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>SGST (9%):</span>
                            <span>₹{sgst.toLocaleString()}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between text-slate-600">
                          <span>IGST (18%):</span>
                          <span>₹{igst.toLocaleString()}</span>
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex justify-between text-slate-900 font-black text-xs border-t border-slate-900 pt-1 px-1.5 py-1 bg-slate-100 rounded">
                    <span>GRAND TOTAL:</span>
                    <span className="text-[#b08d4b]">₹{grandTotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-emerald-700 font-bold pt-0.5">
                    <span>Advance Paid:</span>
                    <span>₹{invoiceAdvance.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-rose-700 font-extrabold text-[11px] border-t border-slate-200 pt-0.5">
                    <span>BALANCE DUE:</span>
                    <span>₹{balanceDue.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Section: Left = UPI Scanner | Right = Terms & Policies */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t-2 border-slate-900 items-start">
                {/* Left: UPI QR Code & Payment Info */}
                <div className="flex items-center gap-2.5 bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`upi://pay?pa=${studioUpiId}&pn=SK%20Studio`)}`}
                    alt="UPI Scan & Pay QR Code"
                    className="w-16 h-16 shrink-0 rounded border border-slate-200 bg-white p-0.5"
                  />
                  <div className="flex flex-col gap-0.5 font-mono text-[9px]">
                    <span className="font-extrabold text-slate-900 uppercase tracking-wider">SCAN & PAY VIA UPI</span>
                    <span className="font-bold text-[#b08d4b] text-[10px]">UPI: {studioUpiId}</span>
                    <span className="text-slate-500 font-medium leading-tight text-[8px]">Accepts GPay, PhonePe, Paytm & UPI Apps</span>
                  </div>
                </div>

                {/* Right: Terms & Policies */}
                <div className="flex flex-col gap-0.5 text-[9px] text-slate-600 leading-normal font-sans">
                  <strong className="text-slate-900 font-bold font-mono uppercase tracking-wider text-[10px]">
                    Terms & Policies:
                  </strong>
                  <ul className="list-disc pl-3 space-y-0.5 text-slate-700">
                    {terms.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Thank You Footer */}
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-[10px] font-mono text-slate-500">
                <span className="font-semibold text-slate-700">Thank you for choosing SK Photo Studio Pune!</span>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
