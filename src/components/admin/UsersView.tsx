"use client";

import React, { useState } from "react";
import { 
  Users, UserCheck, Shield, Mail, Phone, Calendar, Search, 
  MessageSquare, Trash2, CheckCircle, XCircle, Eye, ArrowUpRight,
  RefreshCw, Activity, Clock, ShieldAlert, Sparkles, Filter
} from "lucide-react";

interface UsersViewProps {
  isDark?: boolean;
  users: any[];
  bookings?: any[];
  messages?: any[];
  saveTransaction: (action: string, payload: any) => Promise<any>;
  setSelectedClient?: (email: string) => void;
  setActiveTab?: (tab: string) => void;
  fetchDashboardData: () => void;
}

export default function UsersView({
  users = [],
  bookings = [],
  messages = [],
  saveTransaction,
  setSelectedClient,
  setActiveTab,
  fetchDashboardData
}: UsersViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "admin">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [onlineFilter, setOnlineFilter] = useState<"all" | "online" | "offline">("all");
  const [selectedUserDetail, setSelectedUserDetail] = useState<any | null>(null);

  // Normalize user array and exclude admin from client directory
  const rawList = Array.isArray(users) ? users : Object.entries(users).map(([id, u]: [string, any]) => ({ id, ...u }));
  const userList = rawList.filter(u => u.role !== "admin" && u.id !== "admin" && (u.email || "").toLowerCase() !== "ganeshkalapadgk@gmail.com");

  // Helper to determine if a user is currently online (active within last 10 minutes)
  const isUserOnline = (u: any): boolean => {
    if (!u.lastActiveAt) return false;
    const diffMs = Date.now() - new Date(u.lastActiveAt).getTime();
    return diffMs < 10 * 60 * 1000; // 10 minutes
  };

  // Helper to format last seen
  const formatLastSeen = (u: any): string => {
    if (isUserOnline(u)) return "Online Now";
    if (!u.lastActiveAt) return "Recently Seen";
    const date = new Date(u.lastActiveAt);
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const [localUsers, setLocalUsers] = useState<any[]>(userList);

  // Keep localUsers synced when props update
  React.useEffect(() => {
    setLocalUsers(userList);
  }, [users, userList]);

  // Metrics (Client Users Only)
  const totalUsers = localUsers.length;
  const activeCount = localUsers.filter(u => u.isActive !== false).length;
  const onlineCount = localUsers.filter(u => isUserOnline(u)).length;
  const suspendedCount = localUsers.filter(u => u.isActive === false).length;

  // Filtered registered client users
  const filteredUsers = localUsers.filter((u) => {
    const name = (u.name || "").toLowerCase();
    const email = (u.email || "").toLowerCase();
    const phone = (u.phone || u.mobile || "").toLowerCase();
    const id = (u.id || "").toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch = name.includes(search) || email.includes(search) || phone.includes(search) || id.includes(search);
    const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? u.isActive !== false : u.isActive === false);
    const onlineState = isUserOnline(u);
    const matchesOnline = onlineFilter === "all" || (onlineFilter === "online" ? onlineState : !onlineState);

    return matchesSearch && matchesStatus && matchesOnline;
  });

  const handleDeleteUser = async (user: any) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete user "${user.name || user.email}"? This action cannot be undone.`);
    if (!confirmDelete) return;

    // Optimistic UI update for ultra-fast response
    setLocalUsers(prev => prev.filter(u => (u.id || u.email) !== (user.id || user.email)));
    if (selectedUserDetail?.email === user.email) {
      setSelectedUserDetail(null);
    }

    const res = await saveTransaction("delete_user", { id: user.id || user.email, email: user.email });
    if (res && res.success) {
      fetchDashboardData();
    } else {
      // Revert if request fails
      setLocalUsers(userList);
    }
  };

  const handleToggleStatus = async (user: any) => {
    const newStatus = !(user.isActive !== false);

    // Optimistic UI update for instant 60fps state toggle
    setLocalUsers(prev => prev.map(u => {
      if ((u.id || u.email) === (user.id || user.email)) {
        return { ...u, isActive: newStatus };
      }
      return u;
    }));

    if (selectedUserDetail && (selectedUserDetail.id || selectedUserDetail.email) === (user.id || user.email)) {
      setSelectedUserDetail((prev: any) => prev ? { ...prev, isActive: newStatus } : null);
    }

    const res = await saveTransaction("update_user", {
      id: user.id || user.email,
      email: user.email,
      isActive: newStatus
    });

    if (res && res.success) {
      fetchDashboardData();
    } else {
      // Revert if request fails
      setLocalUsers(userList);
    }
  };

  const handleMessageUser = (email: string) => {
    if (setSelectedClient && setActiveTab) {
      setSelectedClient(email);
      setActiveTab("messaging");
    }
  };

  return (
    <div className="flex flex-col gap-6 text-slate-900 font-sans">
      
      {/* Top Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#b08d4b]/15 border border-[#b08d4b]/30 text-[#b08d4b] flex items-center justify-center font-bold">
            <Users size={24} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 font-display">Registered Client Directory</h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">Real-time client accounts, active status, profiles, and access control.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
          >
            <RefreshCw size={14} /> Refresh Directory
          </button>
        </div>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Client Users", val: totalUsers, desc: `${totalUsers} Registered Clients`, icon: <Users size={20} className="text-[#b08d4b]" /> },
          { label: "Online Now", val: onlineCount, desc: "Active in real-time", icon: <Activity size={20} className="text-emerald-500 animate-pulse" /> },
          { label: "Active Accounts", val: activeCount, desc: `${suspendedCount} Suspended`, icon: <CheckCircle size={20} className="text-sky-600" /> },
          { label: "Suspended Accounts", val: suspendedCount, desc: "Restricted Access", icon: <ShieldAlert size={20} className="text-rose-600" /> }
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between gap-3">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">{stat.label}</span>
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">{stat.icon}</div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-slate-900 font-display">{stat.val}</span>
              <span className="text-[11px] text-slate-500 font-medium">{stat.desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#b08d4b] font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Presence:</span>
            <select
              value={onlineFilter}
              onChange={(e: any) => setOnlineFilter(e.target.value)}
              className="text-xs font-bold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#b08d4b]"
            >
              <option value="all">All Presence</option>
              <option value="online">Online Now 🟢</option>
              <option value="offline">Offline ⚪</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Role:</span>
            <select
              value={roleFilter}
              onChange={(e: any) => setRoleFilter(e.target.value)}
              className="text-xs font-bold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#b08d4b]"
            >
              <option value="all">All Roles</option>
              <option value="user">Clients Only</option>
              <option value="admin">Admins Only</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="text-xs font-bold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#b08d4b]"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* User Directory Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-[#b08d4b]" />
            <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-900">User Directory</h3>
          </div>
          <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
            Showing {filteredUsers.length} of {userList.length} Accounts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-mono text-[10px] uppercase tracking-wider">
                <th className="py-3 px-3">User Profile</th>
                <th className="py-3 px-3">Contact Details</th>
                <th className="py-3 px-3">Live Presence</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Account Status</th>
                <th className="py-3 px-3 text-center">Shoots / Msgs</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredUsers.map((u, idx) => {
                const userEmail = (u.email || "").toLowerCase();
                const userBookings = bookings.filter(b => (b.email || "").toLowerCase() === userEmail);
                const userMsgs = messages.filter(m => (m.senderEmail || m.recipientEmail || "").toLowerCase() === userEmail);
                const onlineState = isUserOnline(u);

                return (
                  <tr key={u.id || idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-9 h-9 rounded-full bg-[#b08d4b]/15 border border-[#b08d4b]/30 text-[#b08d4b] font-bold flex items-center justify-center text-xs shrink-0">
                            {(u.name || u.email || "U")[0].toUpperCase()}
                          </div>
                          {onlineState && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full animate-pulse" title="Online Now" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-extrabold text-slate-900 text-xs">{u.name || "Client"}</span>
                          <span className="text-[9px] font-mono text-slate-400">ID: {u.id || "N/A"}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex flex-col gap-0.5 font-mono text-[11px]">
                        <span className="text-slate-800 font-semibold">{u.email}</span>
                        <span className="text-slate-500">{u.phone || u.mobile || "No phone listed"}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                        onlineState ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${onlineState ? "bg-emerald-500 animate-ping" : "bg-slate-400"}`} />
                        {formatLastSeen(u)}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono tracking-wider ${
                        u.role === "admin" 
                          ? "bg-purple-100 text-purple-800 border border-purple-200" 
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}>
                        {u.role || "user"}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono tracking-wider ${
                        u.isActive !== false 
                          ? "bg-emerald-100 text-emerald-800" 
                          : "bg-rose-100 text-rose-800"
                      }`}>
                        {u.isActive !== false ? <CheckCircle size={11} /> : <XCircle size={11} />}
                        {u.isActive !== false ? "Active" : "Suspended"}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center font-mono">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-lg text-[11px] font-bold text-slate-800">
                        <span>{userBookings.length} shoots</span> • <span>{userMsgs.length} msgs</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedUserDetail(u)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                          title="View Full Profile Details"
                        >
                          <Eye size={14} />
                        </button>
                        
                        <button
                          onClick={() => handleMessageUser(u.email)}
                          className="p-1.5 rounded-lg border border-[#b08d4b]/30 bg-[#b08d4b]/10 hover:bg-[#b08d4b] hover:text-white text-[#b08d4b] transition-all"
                          title="Send Direct Platform Message"
                        >
                          <MessageSquare size={14} />
                        </button>

                        {u.role !== "admin" && u.email?.toLowerCase() !== "ganeshkalapadgk@gmail.com" ? (
                          <>
                            <button
                              onClick={() => handleToggleStatus(u)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition-all flex items-center gap-1.5 ${
                                u.isActive === false
                                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm animate-pulse"
                                  : "bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800"
                              }`}
                              title={u.isActive === false ? "Reactivate & Unsuspend Account" : "Suspend Account"}
                            >
                              {u.isActive === false ? <CheckCircle size={12} /> : <XCircle size={12} />}
                              <span>{u.isActive === false ? "Unsuspend 🟢" : "Suspend"}</span>
                            </button>

                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors"
                              title="Delete User"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md cursor-default select-none" title="Primary Administrator Account Protected">
                            PROTECTED
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 font-mono">No users found matching query.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full User Details Modal */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto flex flex-col gap-6 relative font-sans text-slate-900">
            
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-[#b08d4b]/15 border border-[#b08d4b]/30 text-[#b08d4b] font-black text-lg flex items-center justify-center">
                    {(selectedUserDetail.name || selectedUserDetail.email || "U")[0].toUpperCase()}
                  </div>
                  {isUserOnline(selectedUserDetail) && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-black text-slate-900 font-display">{selectedUserDetail.name || "Client Account"}</span>
                  <span className="text-xs font-mono text-slate-500">{selectedUserDetail.email}</span>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedUserDetail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full text-base font-bold"
              >
                ✕
              </button>
            </div>

            {/* Profile Info Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Full Name</span>
                <span className="font-bold text-slate-900">{selectedUserDetail.name || "N/A"}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Email Address</span>
                <span className="font-mono text-slate-900 font-semibold">{selectedUserDetail.email}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Phone / Mobile</span>
                <span className="font-mono text-slate-900 font-semibold">{selectedUserDetail.phone || selectedUserDetail.mobile || "Not provided"}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Account Role</span>
                <span className="font-bold text-purple-700 uppercase font-mono">{selectedUserDetail.role || "user"}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Account Status</span>
                <span className="font-bold text-emerald-700 uppercase font-mono">{selectedUserDetail.isActive !== false ? "Active" : "Suspended"}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Live Presence</span>
                <span className="font-mono font-bold text-emerald-700">{formatLastSeen(selectedUserDetail)}</span>
              </div>
            </div>

            {/* User Shoot Bookings History */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-900 flex items-center justify-between border-b border-slate-100 pb-2">
                <span>Associated Shoot Bookings</span>
                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full">
                  {bookings.filter(b => (b.email || "").toLowerCase() === selectedUserDetail.email.toLowerCase()).length} Shoots
                </span>
              </h4>

              <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
                {bookings.filter(b => (b.email || "").toLowerCase() === selectedUserDetail.email.toLowerCase()).map((b, i) => (
                  <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-xs">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{b.service}</span>
                      <span className="text-[10px] font-mono text-slate-500">Date: {b.date} • Price: ₹{b.price || "N/A"}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono rounded-full uppercase">
                      {b.status}
                    </span>
                  </div>
                ))}

                {bookings.filter(b => (b.email || "").toLowerCase() === selectedUserDetail.email.toLowerCase()).length === 0 && (
                  <div className="text-center text-xs text-slate-400 font-mono py-4">No shoot bookings linked to this user.</div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedUserDetail(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase rounded-xl"
              >
                Close
              </button>

              {selectedUserDetail.role !== "admin" && selectedUserDetail.email?.toLowerCase() !== "ganeshkalapadgk@gmail.com" && (
                <button
                  onClick={() => handleToggleStatus(selectedUserDetail)}
                  className={`px-4 py-2 text-xs font-bold uppercase rounded-xl flex items-center gap-1.5 transition-all ${
                    selectedUserDetail.isActive === false
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md animate-pulse"
                      : "bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300"
                  }`}
                >
                  {selectedUserDetail.isActive === false ? <CheckCircle size={14} /> : <XCircle size={14} />}
                  {selectedUserDetail.isActive === false ? "Unsuspend Account 🟢" : "Suspend Account 🔴"}
                </button>
              )}

              <button
                onClick={() => {
                  handleMessageUser(selectedUserDetail.email);
                  setSelectedUserDetail(null);
                }}
                className="px-5 py-2 bg-[#b08d4b] hover:bg-[#96753a] text-white text-xs font-bold uppercase rounded-xl flex items-center gap-1.5"
              >
                Open Message Thread <ArrowUpRight size={14} />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
