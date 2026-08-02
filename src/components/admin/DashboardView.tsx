"use client";

import React, { useState } from "react";
import { 
  Calendar, DollarSign, Users, MessageSquare, Plus, FileText, 
  ArrowRight, Clock, CheckCircle2, Shield, Activity, User, Edit, Trash2, Send,
  TrendingUp, PieChart, BarChart2, Check, AlertCircle, ArrowUpRight
} from "lucide-react";

interface DashboardViewProps {
  isDark: boolean;
  bookings: any[];
  orders: any[];
  users: any[];
  auditLogs: any[];
  enquiries: any[];
  messages?: any[];
  setActiveTab: (tab: string) => void;
}

export default function DashboardView({
  isDark,
  bookings = [],
  orders = [],
  users = [],
  auditLogs = [],
  enquiries = [],
  messages = [],
  setActiveTab
}: DashboardViewProps) {
  const [chartMode, setChartMode] = useState<"revenue" | "shoots">("revenue");

  // Basic Metrics
  const activeBookingCount = bookings.filter(b => b.status === "confirmed").length;
  const pendingBookingCount = bookings.filter(b => b.status === "pending").length;
  
  const totalRevenue = bookings.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
  const collectedRevenue = bookings.reduce((acc, curr) => acc + (Number(curr.advancePaid) || 0), 0);
  const pendingPayments = bookings.reduce((acc, curr) => acc + (Number(curr.balanceDue) || 0), 0);
  const newEnquiryCount = enquiries.filter(e => e.status === "New" || !e.status).length;

  // Calculate Service Category Distribution
  const categoryStats = React.useMemo(() => {
    const counts: Record<string, { count: number; total: number; color: string }> = {
      "Wedding Segment": { count: 0, total: 0, color: "bg-amber-500" },
      "Maternity Shoot": { count: 0, total: 0, color: "bg-purple-500" },
      "Baby / Newborn": { count: 0, total: 0, color: "bg-sky-500" },
      "Pre-Wedding": { count: 0, total: 0, color: "bg-[#b08d4b]" },
      "Other Services": { count: 0, total: 0, color: "bg-emerald-500" }
    };

    bookings.forEach((b) => {
      const svc = b.service || "Other Services";
      let key = "Other Services";
      if (svc.toLowerCase().includes("wedding") && !svc.toLowerCase().includes("pre")) key = "Wedding Segment";
      else if (svc.toLowerCase().includes("maternity")) key = "Maternity Shoot";
      else if (svc.toLowerCase().includes("baby") || svc.toLowerCase().includes("newborn")) key = "Baby / Newborn";
      else if (svc.toLowerCase().includes("pre-wedding") || svc.toLowerCase().includes("pre wedding")) key = "Pre-Wedding";

      counts[key].count += 1;
      counts[key].total += Number(b.price) || 0;
    });

    const grand = totalRevenue || 1;
    return Object.entries(counts).map(([name, data]) => ({
      name,
      count: data.count,
      total: data.total,
      percentage: Math.round((data.total / grand) * 100),
      color: data.color
    }));
  }, [bookings, totalRevenue]);

  // Monthly Revenue Data (Aggregated strictly from real bookings)
  const monthlyChartData = React.useMemo(() => {
    const months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"];
    return months.map((m) => {
      const matchingBookings = bookings.filter(b => {
        if (!b.date && !b.createdAt) return false;
        const d = new Date(b.date || b.createdAt);
        return d.toLocaleString("en-US", { month: "short" }) === m;
      });

      const revenue = matchingBookings.reduce((sum, b) => sum + (Number(b.price) || 0), 0);
      const count = matchingBookings.length;

      return { month: m, revenue, count };
    });
  }, [bookings]);

  const maxMonthlyRev = Math.max(...monthlyChartData.map(d => d.revenue), 100000);

  // Format audit log events
  const formatAuditLog = (log: any) => {
    const action = (log.action || "").toLowerCase();
    const details = log.details || {};

    let title = log.action || "System Event";
    let text = "";
    let icon = <Activity size={14} className="text-[#b08d4b]" />;

    if (action.includes("crew") || action.includes("staff")) {
      icon = <Users size={14} className="text-sky-600" />;
      title = "Staff Management";
      text = details.crewName ? `Updated crew list for ${details.crewName}` : "Modified studio staff directory";
    } else if (action.includes("booking")) {
      icon = <Calendar size={14} className="text-emerald-600" />;
      title = "Booking Update";
      text = details.bookingId ? `Updated details for booking #${details.bookingId}` : "Updated client shoot details";
    } else if (action.includes("message")) {
      icon = <Send size={14} className="text-purple-600" />;
      title = "Message Sent";
      text = details.recipientName ? `Sent message to ${details.recipientName}` : "Dispatched client message";
    } else if (action.includes("delete")) {
      icon = <Trash2 size={14} className="text-rose-600" />;
      title = "Record Deleted";
      text = "Removed record from studio records";
    } else {
      text = typeof details === "string" ? details : "Executed administrative update";
    }

    return { title, text, icon };
  };

  return (
    <div className="flex flex-col gap-6 text-slate-900 font-sans">
      
      {/* Quick Executive Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Shoots */}
        <div 
          onClick={() => setActiveTab("bookings")}
          className="bg-white border border-slate-200/90 hover:border-[#b08d4b]/60 p-5 rounded-2xl shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
              Total Shoots
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 group-hover:bg-[#b08d4b] text-[#b08d4b] group-hover:text-white flex items-center justify-center transition-colors">
              <Calendar size={18} />
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-display text-slate-900">{bookings.length}</span>
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-0.5">
                <TrendingUp size={12} /> Live
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              <strong className="text-emerald-700 font-bold">{activeBookingCount} Confirmed</strong> • {pendingBookingCount} Pending
            </p>
          </div>
        </div>

        {/* Card 2: Booked Revenue */}
        <div 
          onClick={() => setActiveTab("payments")}
          className="bg-white border border-slate-200/90 hover:border-[#b08d4b]/60 p-5 rounded-2xl shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
              Booked Revenue
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 group-hover:bg-emerald-600 text-emerald-600 group-hover:text-white flex items-center justify-center transition-colors">
              <DollarSign size={18} />
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-display text-slate-900">
                ₹{totalRevenue.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Collected: <strong className="text-emerald-700 font-mono">₹{collectedRevenue.toLocaleString()}</strong>
            </p>
          </div>
        </div>

        {/* Card 3: Pending Payments */}
        <div 
          onClick={() => setActiveTab("payments")}
          className="bg-white border border-slate-200/90 hover:border-[#b08d4b]/60 p-5 rounded-2xl shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
              Pending Balance
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 group-hover:bg-rose-600 text-rose-600 group-hover:text-white flex items-center justify-center transition-colors">
              <Clock size={18} />
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-display text-rose-600">
                ₹{pendingPayments.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Balance due across active shoot sessions
            </p>
          </div>
        </div>

        {/* Card 4: Enquiries & Messages */}
        <div 
          onClick={() => setActiveTab("enquiries")}
          className="bg-white border border-slate-200/90 hover:border-[#b08d4b]/60 p-5 rounded-2xl shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
              Leads & Messages
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 group-hover:bg-purple-600 text-purple-600 group-hover:text-white flex items-center justify-center transition-colors">
              <MessageSquare size={18} />
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-display text-slate-900">{enquiries.length}</span>
              <span className="text-xs text-purple-600 font-bold">Leads</span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              <strong className="text-purple-700 font-bold">{newEnquiryCount} New Leads</strong> • {messages.length} Messages
            </p>
          </div>
        </div>

      </div>

      {/* Visual Analytics & Simple Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Monthly Revenue Bar Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
                <BarChart2 size={16} className="text-[#b08d4b]" />
                Studio Revenue & Shoot Overview
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-sans">
                Monthly income and package booking trends
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setChartMode("revenue")}
                className={`px-3 py-1 text-xs font-bold font-mono rounded-lg transition-all ${
                  chartMode === "revenue"
                    ? "bg-white text-[#b08d4b] shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Revenue (₹)
              </button>
              <button
                onClick={() => setChartMode("shoots")}
                className={`px-3 py-1 text-xs font-bold font-mono rounded-lg transition-all ${
                  chartMode === "shoots"
                    ? "bg-white text-[#b08d4b] shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Shoot Volume
              </button>
            </div>
          </div>

          {/* SVG/CSS Clean Responsive Bar Graph */}
          <div className="flex flex-col gap-2 pt-2">
            <div className="h-52 flex items-end justify-between gap-3 px-4 border-b border-slate-200 pb-2">
              {monthlyChartData.map((item, idx) => {
                const heightPct = chartMode === "revenue" 
                  ? Math.max(15, Math.min(100, Math.round((item.revenue / maxMonthlyRev) * 100)))
                  : Math.max(15, Math.min(100, Math.round((item.count / 5) * 100)));

                const displayVal = chartMode === "revenue" ? `₹${(item.revenue / 1000).toFixed(0)}k` : `${item.count} Shoots`;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    {/* Tooltip on Hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-mono px-2 py-1 rounded shadow-md pointer-events-none whitespace-nowrap mb-1">
                      {item.month}: {displayVal}
                    </div>

                    {/* Bar Pill */}
                    <div className="w-full max-w-[48px] bg-slate-100 rounded-t-xl overflow-hidden h-full flex items-end p-0.5">
                      <div 
                        style={{ height: `${heightPct}%` }}
                        className={`w-full rounded-t-lg transition-all duration-500 ${
                          chartMode === "revenue" 
                            ? "bg-gradient-to-t from-[#b08d4b] to-amber-400 group-hover:brightness-110" 
                            : "bg-gradient-to-t from-purple-600 to-indigo-400 group-hover:brightness-110"
                        }`}
                      />
                    </div>

                    {/* Month Label */}
                    <span className="text-xs font-mono font-bold text-slate-600 group-hover:text-slate-900">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-2">
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#b08d4b]" /> Total Booked: ₹{totalRevenue.toLocaleString()}
              </span>
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Received: ₹{collectedRevenue.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Shoot Category Breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs flex flex-col justify-between gap-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
              <PieChart size={16} className="text-[#b08d4b]" />
              Shoot Service Categories
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-sans">
              Distribution of packages by revenue
            </p>
          </div>

          <div className="flex flex-col gap-4 my-auto">
            {categoryStats.map((cat, idx) => (
              <div key={idx} className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-800">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                    <span className="font-bold text-slate-900">{cat.name}</span>
                  </div>
                  <span className="font-mono text-slate-500 text-[11px]">
                    {cat.count} shoots • {cat.percentage}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${Math.max(5, cat.percentage)}%` }}
                    className={`h-full rounded-full ${cat.color}`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Total Packages</span>
            <strong className="font-mono text-slate-900 font-extrabold">{bookings.length} Shoots</strong>
          </div>
        </div>

      </div>

      {/* Main Grid: Scheduled Shoots & Enquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upcoming Shoot Schedule Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-[#b08d4b]" />
              <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-900">Upcoming Shoot Schedule</h3>
              <span className="text-[10px] font-bold font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                {bookings.length} Total
              </span>
            </div>
            <button
              onClick={() => setActiveTab("bookings")}
              className="text-xs font-bold text-[#b08d4b] hover:underline flex items-center gap-1"
            >
              View All Shoots <ArrowRight size={13} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-mono text-[10px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Client Name</th>
                  <th className="py-2.5 px-3">Package Service</th>
                  <th className="py-2.5 px-3">Shoot Date</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {bookings.slice(0, 5).map((b, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="font-extrabold text-slate-900 text-xs">{b.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{b.phone || b.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-semibold">{b.service}</td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{b.date}</td>
                    <td className="py-3 px-3 text-right">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase font-mono tracking-wider ${
                        b.status === "confirmed" 
                          ? "bg-emerald-100 text-emerald-800" 
                          : b.status === "pending"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-700"
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-slate-400 font-mono">No upcoming shoots scheduled.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Recent Enquiries */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-900">Recent Client Enquiries</h3>
            <button
              onClick={() => setActiveTab("enquiries")}
              className="text-xs font-bold text-[#b08d4b] hover:underline flex items-center gap-1"
            >
              Pipeline <ArrowRight size={12} />
            </button>
          </div>

          <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1">
            {enquiries.slice(0, 4).map((e, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-1 hover:border-[#b08d4b]/50 transition-colors">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-xs text-slate-900">{e.name || e.customerName || "Client"}</span>
                  <span className="text-[10px] font-bold font-mono text-[#b08d4b] uppercase bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {e.status || "New"}
                  </span>
                </div>
                <span className="text-[11px] text-slate-700 font-medium">{e.service || "General Inquiry"}</span>
                <span className="text-[10px] text-slate-500 font-mono">{e.phone || e.email}</span>
              </div>
            ))}

            {enquiries.length === 0 && (
              <div className="text-center py-8 text-slate-400 font-mono text-xs">No pending client enquiries.</div>
            )}
          </div>
        </div>

      </div>

      {/* Activity Log Stream */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-[#b08d4b]" />
            <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-900">
              Studio Operations Audit Log
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
            {auditLogs.length} Events Logged
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
          {auditLogs.slice(0, 6).map((log) => {
            const formatted = formatAuditLog(log);
            const userDisplay = (log.userEmail || "Admin").split("@")[0];
            const timeDisplay = log.timestamp 
              ? new Date(log.timestamp).toLocaleString("en-IN", { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })
              : "Recent";

            return (
              <div 
                key={log.id} 
                className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl flex items-start gap-3 hover:bg-slate-100 transition-all"
              >
                <div className="p-2 bg-white rounded-lg border border-slate-200 shrink-0 mt-0.5">
                  {formatted.icon}
                </div>

                <div className="flex flex-col gap-0.5 flex-grow min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {formatted.title}
                    </span>
                    <span className="text-[10px] font-mono font-semibold text-slate-400 shrink-0">
                      {timeDisplay}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 font-medium leading-snug line-clamp-2">
                    {formatted.text}
                  </p>

                  <span className="text-[10px] text-[#b08d4b] font-mono font-bold mt-0.5">
                    By {userDisplay}
                  </span>
                </div>
              </div>
            );
          })}

          {auditLogs.length === 0 && (
            <div className="col-span-2 text-center py-8 text-slate-400 font-mono text-xs">
              No recent activity logs recorded.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
