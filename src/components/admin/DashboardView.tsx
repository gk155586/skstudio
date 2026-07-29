import React from "react";
import { 
  Calendar, DollarSign, Users, MessageSquare, Plus, FileText, 
  ArrowRight, Clock, CheckCircle2, Shield, Activity, User, Edit, Trash2, Send
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
  bookings,
  orders,
  users,
  auditLogs,
  enquiries,
  messages = [],
  setActiveTab
}: DashboardViewProps) {
  const activeBookingCount = bookings.filter(b => b.status === "confirmed").length;
  const pendingBookingCount = bookings.filter(b => b.status === "pending").length;
  
  const totalRevenue = bookings.reduce((acc, curr) => acc + (curr.price || 0), 0);
  const pendingPayments = bookings.reduce((acc, curr) => acc + (curr.balanceDue || 0), 0);
  const newEnquiryCount = enquiries.filter(e => e.status === "New" || !e.status).length;

  // Format raw audit logs into human-readable action text
  const formatAuditLog = (log: any) => {
    const action = (log.action || "").toLowerCase();
    const details = log.details || {};

    let title = log.action || "System Event";
    let text = "";
    let icon = <Activity size={14} className="text-[#b08d4b]" />;

    if (action.includes("crew") || action.includes("staff") || details.type === "add" || details.type === "update" || details.type === "delete") {
      icon = <Users size={14} className="text-sky-600" />;
      if (details.type === "add") {
        title = "Added Staff Member";
        text = `Added "${details.name || details.newName || "New Crew"}" to studio team`;
      } else if (details.type === "update") {
        title = "Updated Staff Member";
        text = `Renamed "${details.oldName}" to "${details.newName}"`;
      } else if (details.type === "delete") {
        title = "Removed Staff Member";
        text = `Removed "${details.name}" from studio team`;
      } else {
        title = "Staff Management";
        text = typeof details === "string" ? details : "Modified staff directory";
      }
    } else if (action.includes("booking")) {
      icon = <Calendar size={14} className="text-emerald-600" />;
      title = "Booking Update";
      text = details.name ? `Updated shoot for ${details.name}` : "Updated client booking details";
    } else if (action.includes("message")) {
      icon = <Send size={14} className="text-purple-600" />;
      title = "Message Dispatched";
      text = details.recipientName ? `Sent message to ${details.recipientName}` : "Dispatched client communication";
    } else if (action.includes("content") || action.includes("settings")) {
      icon = <Edit size={14} className="text-amber-600" />;
      title = "Studio Settings Updated";
      text = "Modified studio operational settings or website text";
    } else {
      if (typeof details === "string") {
        text = details;
      } else if (details.name || details.title) {
        text = `${details.name || details.title}`;
      } else {
        text = "Executed system administrative update";
      }
    }

    return { title, text, icon };
  };

  return (
    <div className="flex flex-col gap-8 text-slate-900 font-sans">
      
      {/* Quick Action Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-black font-display tracking-tight text-[#b08d4b]">
            SK PHOTO STUDIO PUNE
          </h2>
          <p className="text-xs text-slate-300 font-medium">
            Studio Operations Overview • {new Date().toLocaleDateString("en-IN", { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveTab("bookings")}
            className="px-4 py-2 bg-[#b08d4b] hover:bg-[#96753a] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow transition-all flex items-center gap-2"
          >
            <Plus size={14} /> New Booking
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2"
          >
            <FileText size={14} /> Generate Invoice
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "Bookings", val: bookings.length, desc: `${activeBookingCount} Confirmed • ${pendingBookingCount} Pending`, icon: <Calendar size={20} className="text-[#b08d4b]" />, tab: "bookings" },
          { label: "Booked Revenue", val: `₹${totalRevenue.toLocaleString()}`, desc: "Total from shoot packages", icon: <DollarSign size={20} className="text-emerald-600" />, tab: "payments" },
          { label: "Pending Payments", val: `₹${pendingPayments.toLocaleString()}`, desc: "Balance due across shoots", icon: <Clock size={20} className="text-rose-600" />, tab: "payments" },
          { label: "Client Inquiries", val: enquiries.length, desc: `${newEnquiryCount} New Leads • ${messages.length} Messages`, icon: <MessageSquare size={20} className="text-sky-600" />, tab: "enquiries" },
        ].map((stat, idx) => (
          <div 
            key={idx} 
            onClick={() => setActiveTab(stat.tab)}
            className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-4 group"
          >
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">{stat.label}</span>
              <div className="p-2.5 rounded-xl bg-slate-100 group-hover:bg-[#b08d4b]/10 transition-colors">
                {stat.icon}
              </div>
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-2xl font-black font-display text-slate-900">{stat.val}</span>
              <span className="text-[11px] text-slate-500 font-medium">{stat.desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Recent Bookings & Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Scheduled Shoots Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-900">Upcoming Shoot Schedule</h3>
              <span className="text-[10px] font-bold font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                {bookings.length} Shoots
              </span>
            </div>
            <button
              onClick={() => setActiveTab("bookings")}
              className="text-xs font-bold text-[#b08d4b] hover:underline flex items-center gap-1"
            >
              View All <ArrowRight size={12} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-mono text-[10px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Client</th>
                  <th className="py-2.5 px-3">Service</th>
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

        {/* Quick Enquiries Widget */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-900">Recent Enquiries</h3>
            <button
              onClick={() => setActiveTab("enquiries")}
              className="text-xs font-bold text-[#b08d4b] hover:underline"
            >
              View Pipeline
            </button>
          </div>

          <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1">
            {enquiries.slice(0, 4).map((e, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-xs text-slate-900">{e.name || e.customerName || "Unknown"}</span>
                  <span className="text-[10px] font-bold font-mono text-[#b08d4b] uppercase">{e.status || "New"}</span>
                </div>
                <span className="text-[11px] text-slate-600 font-medium">{e.service || e.frameName || "General Inquiry"}</span>
                <span className="text-[10px] text-slate-500 font-mono">{e.phone || e.customerPhone || e.email || e.customerEmail}</span>
              </div>
            ))}

            {enquiries.length === 0 && (
              <div className="text-center py-8 text-slate-400 font-mono text-xs">No pending enquiries.</div>
            )}
          </div>
        </div>

      </div>

      {/* Clean Human-Readable Activity Log / Audit Stream */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-[#b08d4b]" />
            <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-900">
              Studio Activity & Audit Log
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
            {auditLogs.length} Events Logged
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
          {auditLogs.map((log) => {
            const formatted = formatAuditLog(log);
            const userDisplay = (log.userEmail || "Admin").split("@")[0];
            const timeDisplay = log.timestamp 
              ? new Date(log.timestamp).toLocaleString("en-IN", { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })
              : "Recent";

            return (
              <div 
                key={log.id} 
                className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl flex items-start gap-3 hover:bg-slate-100/70 transition-all"
              >
                <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs shrink-0 mt-0.5">
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

                  <span className="text-[10px] text-[#b08d4b] font-mono font-bold mt-1">
                    By {userDisplay}
                  </span>
                </div>
              </div>
            );
          })}

          {auditLogs.length === 0 && (
            <div className="col-span-2 text-center py-8 text-slate-400 font-mono text-xs">
              No recent studio activity logs recorded.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
