"use client";

import React, { useState } from "react";
import { 
  Users, UserCheck, Shield, Mail, Phone, Calendar, Search, 
  MessageSquare, Trash2, CheckCircle, XCircle, Eye, ArrowUpRight,
  MessageCircle, Send, RefreshCw
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
  const [activeSubTab, setActiveSubTab] = useState<"directory" | "widget_chats">("directory");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "admin">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [selectedUserDetail, setSelectedUserDetail] = useState<any | null>(null);

  // Widget Chat Reply state inside admin panel
  const [selectedWidgetClient, setSelectedWidgetClient] = useState<string>("");
  const [widgetReplyText, setWidgetReplyText] = useState<string>("");
  const [isReplying, setIsReplying] = useState<boolean>(false);

  // Normalize user array
  const userList = Array.isArray(users) ? users : Object.entries(users).map(([id, u]: [string, any]) => ({ id, ...u }));

  // Helper: resolve a clean display name from email using userList
  const resolveClientName = (email: string): string => {
    if (!email) return "Guest Client";
    const user = userList.find((u) => (u.email || "").toLowerCase() === email.toLowerCase());
    if (user?.name) {
      if (email.toLowerCase() !== "ganeshkalapadgk@gmail.com" && user.name === "Ganesh Kalapad (Admin)") {
        return email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      }
      return user.name.replace(/\s*\(Ph:.*\)$/i, "").trim() || user.name;
    }
    // Try to extract name from messages senderName (excluding admin)
    const userMsg = (messages || []).find(
      (m: any) => m.sender === "user" && m.senderName && !m.senderName.includes("Admin") && (m.senderEmail || m.recipientEmail || "").toLowerCase() === email.toLowerCase()
    );
    if (userMsg?.senderName) {
      return userMsg.senderName.replace(/\s*\(Ph:.*\)$/i, "").trim();
    }
    if (email.startsWith("guest_")) return "Guest Client";
    return email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Filter widget chat threads (from logged-in users or guest IDs)
  const widgetMessages = (messages || []).filter(
    (m) => m.channel === "floating_widget" || (m.id && (m.id.startsWith("msg-widget") || m.id.startsWith("msg-bot"))) || (m.senderName && m.senderName.includes("Ph:"))
  );

  const widgetClientIdentifiers = Array.from(
    new Set([
      ...widgetMessages.map((m) => (m.sender === "user" ? (m.senderEmail || m.recipientEmail) : (m.recipientEmail || m.senderEmail))).filter(Boolean)
    ])
  );

  // Set default selected widget client
  React.useEffect(() => {
    if (!selectedWidgetClient && widgetClientIdentifiers.length > 0) {
      setSelectedWidgetClient(widgetClientIdentifiers[0] as string);
    }
  }, [widgetClientIdentifiers, selectedWidgetClient]);

  // Metrics
  const totalUsers = userList.length;
  const activeCount = userList.filter(u => u.isActive !== false).length;
  const clientCount = userList.filter(u => u.role !== "admin").length;
  const adminCount = userList.filter(u => u.role === "admin").length;

  // Filtered registered users
  const filteredUsers = userList.filter((u) => {
    const name = (u.name || "").toLowerCase();
    const email = (u.email || "").toLowerCase();
    const phone = (u.phone || u.mobile || "").toLowerCase();
    const id = (u.id || "").toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch = name.includes(search) || email.includes(search) || phone.includes(search) || id.includes(search);
    const matchesRole = roleFilter === "all" || (roleFilter === "admin" ? u.role === "admin" : u.role !== "admin");
    const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? u.isActive !== false : u.isActive === false);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleDeleteUser = async (user: any) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete user "${user.name || user.email}"? This action cannot be undone.`);
    if (!confirmDelete) return;

    const res = await saveTransaction("delete_user", { id: user.id || user.email, email: user.email });
    if (res && res.success) {
      fetchDashboardData();
      if (selectedUserDetail?.email === user.email) {
        setSelectedUserDetail(null);
      }
    }
  };

  const handleToggleStatus = async (user: any) => {
    const newStatus = !(user.isActive !== false);
    const res = await saveTransaction("update_user", {
      id: user.id || user.email,
      email: user.email,
      isActive: newStatus
    });
    if (res && res.success) {
      fetchDashboardData();
    }
  };

  const handleMessageUser = (email: string) => {
    if (setSelectedClient && setActiveTab) {
      setSelectedClient(email);
      setActiveTab("messaging");
    }
  };

  const handleSendWidgetReply = async () => {
    if (!widgetReplyText.trim() || !selectedWidgetClient || isReplying) return;
    const text = widgetReplyText.trim();
    setWidgetReplyText("");
    setIsReplying(true);

    try {
      const userObj = userList.find((u) => u.email?.toLowerCase() === selectedWidgetClient.toLowerCase());
      const res = await fetch("/api/admin/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "floating_widget",
          recipientEmail: selectedWidgetClient,
          recipientPhone: userObj?.phone || "",
          recipientName: userObj?.name || "Widget Client",
          messageText: text,
        }),
      });

      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error("Widget reply failed:", err);
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-slate-900 font-sans">
      
      {/* Top Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveSubTab("directory")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeSubTab === "directory"
                ? "bg-[#b08d4b] text-white shadow-md"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Users size={15} /> Registered Users Directory ({totalUsers})
          </button>

          <button
            onClick={() => setActiveSubTab("widget_chats")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeSubTab === "widget_chats"
                ? "bg-[#c1442d] text-white shadow-md animate-pulse"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <MessageCircle size={15} /> Floating Widget Live Chats ({widgetClientIdentifiers.length})
          </button>
        </div>

        <button
          onClick={fetchDashboardData}
          className="p-2 text-slate-400 hover:text-slate-700 bg-white border border-slate-200 rounded-xl transition-colors"
          title="Refresh User Data"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {activeSubTab === "directory" ? (
        <>
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Users", val: totalUsers, desc: "Registered accounts in database", icon: <Users size={20} className="text-[#b08d4b]" /> },
              { label: "Active Clients", val: clientCount, desc: "Client accounts", icon: <UserCheck size={20} className="text-emerald-600" /> },
              { label: "Active Status", val: activeCount, desc: `${totalUsers - activeCount} Suspended / Inactive`, icon: <CheckCircle size={20} className="text-sky-600" /> },
              { label: "Administrators", val: adminCount, desc: "System admin access", icon: <Shield size={20} className="text-purple-600" /> }
            ].map((stat, i) => (
              <div key={i} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between gap-3">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">{stat.label}</span>
                  <div className="p-2 bg-slate-100 rounded-xl">{stat.icon}</div>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-slate-900 font-display">{stat.val}</span>
                  <span className="text-[11px] text-slate-500 font-medium">{stat.desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Filter and Search Bar */}
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
                <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-900">Registered Users Directory</h3>
              </div>
              <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
                Showing {filteredUsers.length} of {userList.length} Users
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-mono text-[10px] uppercase tracking-wider">
                    <th className="py-3 px-3">User Profile</th>
                    <th className="py-3 px-3">Contact Details</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Registered On</th>
                    <th className="py-3 px-3 text-center">Shoots / Msgs</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredUsers.map((u, idx) => {
                    const userEmail = (u.email || "").toLowerCase();
                    const userBookings = bookings.filter(b => (b.email || "").toLowerCase() === userEmail);
                    const userMsgs = messages.filter(m => (m.senderEmail || m.recipientEmail || "").toLowerCase() === userEmail);

                    return (
                      <tr key={u.id || idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#b08d4b]/15 border border-[#b08d4b]/30 text-[#b08d4b] font-bold flex items-center justify-center text-xs shrink-0">
                              {(u.name || u.email || "U")[0].toUpperCase()}
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

                        <td className="py-3.5 px-3 font-mono text-[11px] text-slate-600">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }) : "N/A"}
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
                            </button>                             {u.role !== "admin" && u.email?.toLowerCase() !== "ganeshkalapadgk@gmail.com" ? (
                              <>
                                <button
                                  onClick={() => handleToggleStatus(u)}
                                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                                  title={u.isActive !== false ? "Suspend User" : "Activate User"}
                                >
                                  {u.isActive !== false ? <XCircle size={14} className="text-amber-600" /> : <CheckCircle size={14} className="text-emerald-600" />}
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
        </>
      ) : (
        /* Floating Widget Live Chats Sub-Section */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[650px] text-slate-900">
          
          {/* Threads List Sidebar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col gap-3 h-full overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MessageCircle size={16} className="text-[#c1442d]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                  Widget Chat Threads
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold bg-[#c1442d]/10 text-[#c1442d] px-2.5 py-0.5 rounded-full">
                {widgetClientIdentifiers.length} Conversations
              </span>
            </div>

            <div className="flex-grow overflow-y-auto flex flex-col gap-2 pr-1">
              {widgetClientIdentifiers.length === 0 ? (
                <div className="text-center text-slate-400 text-xs py-12 font-mono">
                  No widget chat enquiries received yet.
                </div>
              ) : (
                widgetClientIdentifiers.map((id) => {
                  const target = (id as string).toLowerCase();
                  const threadMsgs = widgetMessages.filter(
                    (m) => (m.senderEmail || m.recipientEmail || "").toLowerCase() === target
                  );
                  const lastMsg = threadMsgs[threadMsgs.length - 1];
                  const unreadCount = threadMsgs.filter((m) => m.sender === "user" && !m.isRead).length;
                  const isSelected = selectedWidgetClient.toLowerCase() === target;

                  return (
                    <button
                      key={id as string}
                      onClick={() => setSelectedWidgetClient(id as string)}
                      className={`w-full p-3 rounded-xl text-left border flex flex-col gap-1 transition-all ${
                        isSelected
                          ? "bg-[#c1442d]/10 border-[#c1442d] shadow-sm"
                          : "border-slate-100 bg-slate-50/50 hover:bg-slate-100 text-slate-700"
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-bold ${isSelected ? "text-[#c1442d]" : "text-slate-900"}`}>
                            {resolveClientName(id as string)}
                          </span>
                          {unreadCount > 0 && (
                            <span className="bg-rose-600 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                              {unreadCount} NEW
                            </span>
                          )}
                        </div>
                        {lastMsg && (
                          <span className="text-[9px] font-mono text-slate-400">
                            {new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono truncate">{id as string}</span>
                      {lastMsg && (
                        <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5 font-medium">
                          {lastMsg.sender === "admin" ? "You: " : ""}{lastMsg.body}
                        </p>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Active Chat Conversation Panel */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-full overflow-hidden">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#c1442d]/10 border border-[#c1442d]/30 text-[#c1442d] font-black text-xs flex items-center justify-center">
                  {resolveClientName(selectedWidgetClient)[0].toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900">
                    {selectedWidgetClient ? resolveClientName(selectedWidgetClient) : "Select Widget Client Thread"}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {selectedWidgetClient || "No client selected"} · Floating Chat Widget
                  </span>
                </div>
              </div>
            </div>

            {/* Chat Stream */}
            <div className="flex-grow overflow-y-auto my-4 pr-2 flex flex-col gap-2.5">
              {!selectedWidgetClient ? (
                <div className="text-center text-slate-400 text-xs my-auto font-mono">
                  Select a widget chat thread from the left panel.
                </div>
              ) : (
                widgetMessages
                  .filter((m) => {
                    const target = selectedWidgetClient.toLowerCase();
                    const sender = (m.senderEmail || "").toLowerCase();
                    const recipient = (m.recipientEmail || "").toLowerCase();
                    return sender === target || recipient === target;
                  })
                  .map((m) => {
                    const isAdmin = m.sender === "admin";
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col max-w-[80%] p-3 rounded-xl text-xs ${
                          isAdmin
                            ? "self-end bg-[#c1442d] text-white rounded-br-none"
                            : "self-start bg-slate-100 border border-slate-200 text-slate-900 rounded-bl-none"
                        }`}
                      >
                        <div className={`flex justify-between items-center gap-4 mb-1 text-[9px] font-mono ${isAdmin ? "text-white/80" : "text-slate-500"}`}>
                          <span className="font-bold">{isAdmin ? "You (Admin)" : resolveClientName(m.senderEmail || m.recipientEmail || "")}</span>
                          <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="whitespace-pre-line leading-relaxed">{m.body}</p>
                      </div>
                    );
                  })
              )}
            </div>

            {/* Reply Bar */}
            <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
              <input
                type="text"
                placeholder={selectedWidgetClient ? `Reply to ${resolveClientName(selectedWidgetClient)}...` : "Select client..."}
                disabled={!selectedWidgetClient}
                value={widgetReplyText}
                onChange={(e) => setWidgetReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendWidgetReply();
                  }
                }}
                className="flex-grow px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#c1442d] font-medium"
              />

              <button
                onClick={handleSendWidgetReply}
                disabled={!widgetReplyText.trim() || !selectedWidgetClient || isReplying}
                className="px-5 py-2.5 bg-[#c1442d] hover:bg-[#a83823] disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm flex items-center gap-1.5 transition-all shrink-0"
              >
                {isReplying ? "Sending..." : "Reply"} <Send size={13} />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Full User Details Modal */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto flex flex-col gap-6 relative font-sans text-slate-900">
            
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#b08d4b]/15 border border-[#b08d4b]/30 text-[#b08d4b] font-black text-lg flex items-center justify-center">
                  {(selectedUserDetail.name || selectedUserDetail.email || "U")[0].toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-black text-slate-900 font-display">{selectedUserDetail.name || "Client Account"}</span>
                  <span className="text-xs font-mono text-slate-500">{selectedUserDetail.email}</span>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedUserDetail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
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
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Registration Date</span>
                <span className="font-mono text-slate-700">{selectedUserDetail.createdAt ? new Date(selectedUserDetail.createdAt).toLocaleString() : "N/A"}</span>
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
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedUserDetail(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase rounded-xl"
              >
                Close
              </button>
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
