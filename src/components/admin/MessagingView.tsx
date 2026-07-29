"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Send, Mail, Phone, MessageSquare, Search, CheckCheck, 
  Sparkles, User, Clock, Check, RefreshCw
} from "lucide-react";

interface MessagingViewProps {
  isDark?: boolean;
  users: any[];
  messages: any[];
  selectedClient: string;
  setSelectedClient: (email: string) => void;
  chatChannel?: string;
  setChatChannel?: (channel: string) => void;
  saveTransaction?: (action: string, payload: any) => Promise<any>;
  fetchDashboardData: () => void;
}

export default function MessagingView({
  users = [],
  messages = [],
  selectedClient,
  setSelectedClient,
  fetchDashboardData
}: MessagingViewProps) {
  const [chatInput, setChatInput] = useState<string>("");
  const [clientSearch, setClientSearch] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Real-Time Auto-Polling: Refresh message stream every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      fetchDashboardData();
    }, 3000);
    return () => clearInterval(timer);
  }, [fetchDashboardData]);

  // Extract unique client emails from both user directory and message history
  const allClientEmails = Array.from(
    new Set([
      ...users.filter(u => u.role !== "admin" && u.email).map(u => u.email.toLowerCase()),
      ...messages
        .map(m => (m.sender === "user" ? (m.senderEmail || m.recipientEmail) : m.recipientEmail))
        .filter(e => e && e !== "admin" && !e.includes("skstudiopune@gmail.com"))
        .map(e => e.toLowerCase())
    ])
  );

  // Filter clients by search term
  const filteredClients = allClientEmails.filter((email) => {
    const userObj = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    const name = (userObj?.name || email).toLowerCase();
    const phone = (userObj?.phone || userObj?.mobile || "").toLowerCase();
    const term = clientSearch.toLowerCase();
    return name.includes(term) || email.includes(term) || phone.includes(term);
  });

  // Automatically select first client if none selected
  useEffect(() => {
    if (!selectedClient && allClientEmails.length > 0) {
      setSelectedClient(allClientEmails[0]);
    }
  }, [allClientEmails, selectedClient, setSelectedClient]);

  // Auto-scroll chat stream to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedClient]);

  // Mark client messages as read when admin clicks/selects thread
  const handleSelectClient = async (email: string) => {
    setSelectedClient(email);
    try {
      await fetch(`/api/admin/messages?markRead=true&email=${encodeURIComponent(email)}`);
      fetchDashboardData();
    } catch (err) {}
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !selectedClient || isSending) return;
    const userObj = users.find(u => u.email?.toLowerCase() === selectedClient.toLowerCase());
    const textToSend = chatInput.trim();
    setChatInput("");
    setIsSending(true);

    try {
      const res = await fetch("/api/admin/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail: selectedClient,
          recipientPhone: userObj?.phone || userObj?.mobile || "",
          recipientName: userObj?.name || "Client",
          messageText: textToSend
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        fetchDashboardData();
      }
    } catch (e) {
      console.error("Message send failed:", e);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleApplyTemplate = (tpl: string) => {
    const userObj = users.find(u => u.email?.toLowerCase() === selectedClient.toLowerCase());
    const clientName = userObj?.name || "Client";
    let text = "";
    if (tpl === "confirm") {
      text = `Hi ${clientName}, this is SK Photo Studio Pune. We are excited to confirm your photoshoot booking!`;
    } else if (tpl === "payment") {
      text = `Dear ${clientName}, this is a gentle reminder that your shoot invoice balance is ready.`;
    } else if (tpl === "remind") {
      text = `Hello ${clientName}, your photography session is scheduled for tomorrow at SK Photo Studio Pune, Bhosari.`;
    } else if (tpl === "feedback") {
      text = `Hi ${clientName}, we hope you loved your photos! Please drop a quick rating on our Google review page.`;
    }
    setChatInput(text);
  };

  const currentClientUser = users.find(u => u.email?.toLowerCase() === (selectedClient || "").toLowerCase());
  
  const clientMessages = messages.filter((m) => {
    const target = (selectedClient || "").toLowerCase();
    const recipient = (m.recipientEmail || "").toLowerCase();
    const sender = (m.senderEmail || "").toLowerCase();
    return recipient === target || sender === target;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px] text-slate-900 font-sans">
      
      {/* Threads Sidebar Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col gap-3 h-full overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-[#b08d4b]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              Client Conversations
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
              {allClientEmails.length} Clients
            </span>
            <button 
              onClick={() => fetchDashboardData()} 
              className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
              title="Refresh messages"
            >
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        {/* Client Search */}
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search client by name, email, phone..."
            value={clientSearch}
            onChange={(e) => setClientSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#b08d4b] font-medium"
          />
        </div>

        {/* Client List */}
        <div className="flex-grow overflow-y-auto flex flex-col gap-1.5 pr-1">
          {filteredClients.length === 0 ? (
            <div className="text-center text-slate-400 text-xs py-12 font-mono">No matching clients found</div>
          ) : (
            filteredClients.map((email) => {
              const u = users.find(x => x.email?.toLowerCase() === email.toLowerCase());
              const name = u?.name || email.split("@")[0];
              const isSelected = selectedClient?.toLowerCase() === email.toLowerCase();
              
              const userMsgs = messages.filter(
                m => (m.recipientEmail && m.recipientEmail.toLowerCase() === email) ||
                     (m.senderEmail && m.senderEmail.toLowerCase() === email)
              );
              const lastMsg = userMsgs[userMsgs.length - 1];
              const unreadCount = userMsgs.filter(m => m.sender === "user" && !m.isRead).length;

              return (
                <button
                  key={email}
                  onClick={() => handleSelectClient(email)}
                  className={`w-full p-3 rounded-xl text-left border flex flex-col gap-1 transition-all ${
                    isSelected
                      ? "bg-[#b08d4b]/15 border-[#b08d4b] shadow-sm"
                      : "border-slate-100 bg-slate-50/50 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold ${isSelected ? "text-[#b08d4b]" : "text-slate-900"}`}>
                        {name}
                      </span>
                      {unreadCount > 0 && (
                        <span className="bg-rose-600 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                          {unreadCount} NEW
                        </span>
                      )}
                    </div>
                    {userMsgs.length > 0 && lastMsg && (
                      <span className="text-[9px] font-mono text-slate-400">
                        {new Date(lastMsg.timestamp).toLocaleDateString([], { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono truncate">{email}</span>
                  {lastMsg && (
                    <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5 font-medium">
                      {lastMsg.sender === "admin" ? "You: " : `${lastMsg.senderName || 'Client'}: `}{lastMsg.body}
                    </p>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Conversation Panel */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between h-full overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#b08d4b]/15 border border-[#b08d4b]/30 flex items-center justify-center text-[#b08d4b] font-black text-sm">
              {(currentClientUser?.name || selectedClient || "C")[0].toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-extrabold text-slate-900">{currentClientUser?.name || selectedClient || "Select Client"}</span>
              <span className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
                <Mail size={11} className="text-slate-400" /> {selectedClient || "N/A"}
                {(currentClientUser?.phone || currentClientUser?.mobile) && (
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    • <Phone size={11} className="text-slate-400" /> {currentClientUser.phone || currentClientUser.mobile}
                  </span>
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#b08d4b]/15 text-[#b08d4b] border border-[#b08d4b]/30 rounded-full text-[10px] font-extrabold uppercase font-mono tracking-wider">
              ⚡ Platform 2-Way Chat
            </span>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-grow overflow-y-auto my-4 pr-2 flex flex-col gap-3">
          {!selectedClient ? (
            <div className="text-center text-slate-400 text-xs my-auto font-mono">
              Select a client from the left panel to open their conversation thread.
            </div>
          ) : clientMessages.length === 0 ? (
            <div className="text-center text-slate-400 text-xs my-auto font-mono py-12">
              No previous conversation logged for {selectedClient}. Send a message below to start thread!
            </div>
          ) : (
            clientMessages.map((msg) => {
              const isAdmin = msg.sender === "admin";

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[80%] p-3.5 rounded-2xl text-xs ${
                    isAdmin
                      ? "self-end bg-[#b08d4b] text-white rounded-br-none shadow-sm"
                      : "self-start bg-slate-100 border border-slate-200 text-slate-900 rounded-bl-none"
                  }`}
                >
                  <div className={`flex justify-between items-center gap-4 mb-1 text-[9px] font-mono ${isAdmin ? "text-white/80" : "text-slate-500"}`}>
                    <span className="font-bold">{isAdmin ? "SK Studio Admin" : (msg.senderName || "Client")}</span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <p className="whitespace-pre-line leading-relaxed">{msg.body}</p>

                  <div className={`flex justify-end mt-1 text-[9px] font-mono ${isAdmin ? "text-white/70" : "text-slate-400"}`}>
                    <CheckCheck size={12} />
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Response Templates & Send Bar */}
        <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono shrink-0 mr-1">Quick Reply:</span>
            <button
              onClick={() => handleApplyTemplate("confirm")}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[10px] font-bold tracking-wide whitespace-nowrap transition-colors"
            >
              Confirm Shoot
            </button>
            <button
              onClick={() => handleApplyTemplate("payment")}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[10px] font-bold tracking-wide whitespace-nowrap transition-colors"
            >
              Payment Reminder
            </button>
            <button
              onClick={() => handleApplyTemplate("remind")}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[10px] font-bold tracking-wide whitespace-nowrap transition-colors"
            >
              Shoot Reminder
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder={selectedClient ? `Type real-time message to ${currentClientUser?.name || selectedClient}...` : "Select client first..."}
              disabled={!selectedClient}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-grow px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#b08d4b] focus:bg-white font-medium transition-all disabled:opacity-50"
            />

            <button
              onClick={handleSendMessage}
              disabled={!chatInput.trim() || !selectedClient || isSending}
              className="px-5 py-2.5 bg-[#b08d4b] hover:bg-[#96753a] disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm flex items-center gap-1.5 transition-all shrink-0"
            >
              {isSending ? "Sending..." : "Send"} <Send size={13} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
