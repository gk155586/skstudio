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

  // Extract unique client identifiers from both user directory and message history (most recent first)
  const allClientEmails = Array.from(
    new Set([
      ...messages
        .slice()
        .reverse()
        .map(m => (m.sender === "user" ? (m.senderEmail || m.recipientEmail) : (m.recipientEmail || m.senderEmail)))
        .filter(e => e && e !== "admin" && !e.includes("skstudiopune@gmail.com")),
      ...users.filter(u => u.role !== "admin" && u.email).map(u => u.email.toLowerCase())
    ])
  );

  // Filter clients by search term or sender name
  const filteredClients = allClientEmails.filter((email) => {
    const userObj = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    const userMsgs = messages.filter(
      m => (m.recipientEmail && m.recipientEmail.toLowerCase() === email.toLowerCase()) ||
           (m.senderEmail && m.senderEmail.toLowerCase() === email.toLowerCase())
    );
    const msgSender = userMsgs.find(m => m.senderName && m.senderName !== "You" && !m.senderName.includes("Admin") && !m.senderName.includes("Assistant"));
    
    const name = (userObj?.name || msgSender?.senderName || email).toLowerCase();
    const phone = (userObj?.phone || userObj?.mobile || msgSender?.recipientPhone || "").toLowerCase();
    const term = clientSearch.toLowerCase();
    return name.includes(term) || email.toLowerCase().includes(term) || phone.includes(term);
  });

  // Automatically select first client if none selected
  useEffect(() => {
    if (allClientEmails.length > 0) {
      setSelectedClient((prev) => prev || allClientEmails[0]);
    }
  }, [allClientEmails, setSelectedClient]);

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
    const userMsgs = messages.filter(
      m => (m.recipientEmail && m.recipientEmail.toLowerCase() === selectedClient.toLowerCase()) ||
           (m.senderEmail && m.senderEmail.toLowerCase() === selectedClient.toLowerCase())
    );
    const msgUser = userMsgs.find(m => m.senderName && !m.senderName.includes("Admin") && !m.senderName.includes("Assistant"));

    const textToSend = chatInput.trim();
    setChatInput("");
    setIsSending(true);

    try {
      const res = await fetch("/api/admin/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail: selectedClient,
          recipientPhone: userObj?.phone || userObj?.mobile || msgUser?.recipientPhone || "",
          recipientName: userObj?.name || msgUser?.senderName || "Client",
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

  const currentGuestMsg = clientMessages.find(m => m.senderName && !m.senderName.includes("Admin") && !m.senderName.includes("Assistant"));
  const headerDisplayName = currentClientUser?.name || currentGuestMsg?.senderName || (selectedClient.startsWith("guest_") ? "Live Guest Client" : selectedClient);

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
              {allClientEmails.length} Conversations
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
            placeholder="Search client by name, phone..."
            value={clientSearch}
            onChange={(e) => setClientSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#b08d4b] font-medium"
          />
        </div>

        {/* Client List */}
        <div className="flex-grow overflow-y-auto flex flex-col gap-1.5 pr-1">
          {filteredClients.length === 0 ? (
            <div className="text-center text-slate-400 text-xs py-12 font-mono">No active conversations found</div>
          ) : (
            filteredClients.map((email) => {
              const u = users.find(x => x.email?.toLowerCase() === email.toLowerCase());
              const isSelected = selectedClient?.toLowerCase() === email.toLowerCase();
              
              const userMsgs = messages.filter(
                m => (m.recipientEmail && m.recipientEmail.toLowerCase() === email.toLowerCase()) ||
                     (m.senderEmail && m.senderEmail.toLowerCase() === email.toLowerCase())
              );
              const lastMsg = userMsgs[userMsgs.length - 1];
              const unreadCount = userMsgs.filter(m => m.sender === "user" && !m.isRead).length;

              const msgSender = userMsgs.find(m => m.senderName && !m.senderName.includes("Admin") && !m.senderName.includes("Assistant"));
              const displayName = u?.name || msgSender?.senderName || (email.startsWith("guest_") ? "Live Guest Client" : email);

              return (
                <button
                  key={email}
                  onClick={() => handleSelectClient(email)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-start justify-between gap-2 ${
                    isSelected 
                      ? "bg-[#b08d4b]/10 border-[#b08d4b] shadow-sm" 
                      : "bg-white border-slate-100 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
                      isSelected ? "bg-[#b08d4b] text-white" : "bg-slate-100 text-slate-600"
                    }`}>
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {displayName}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {lastMsg ? lastMsg.body : "No messages yet"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 gap-1">
                    <span className="text-[9px] text-slate-400 font-mono">
                      {lastMsg ? new Date(lastMsg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                    </span>
                    {unreadCount > 0 && (
                      <span className="bg-rose-500 text-white font-mono text-[9px] font-bold px-1.5 py-0.2 rounded-full animate-bounce">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Conversation Workspace */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col h-full overflow-hidden">
        
        {/* Header Bar */}
        {selectedClient ? (
          <>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#b08d4b]/15 text-[#b08d4b] font-extrabold flex items-center justify-center text-sm border border-[#b08d4b]/30">
                  {headerDisplayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    {headerDisplayName}
                  </h2>
                  <p className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
                    <Mail size={10} /> {selectedClient}
                    {currentClientUser?.phone && (
                      <span className="flex items-center gap-1 text-slate-500 font-semibold">
                        <Phone size={10} /> {currentClientUser.phone}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Action shortcuts */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleApplyTemplate("confirm")}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-[#b08d4b]/10 hover:text-[#b08d4b] text-slate-700 text-[10px] font-bold rounded-lg transition-colors"
                >
                  Confirm Template
                </button>
                <button
                  onClick={() => handleApplyTemplate("remind")}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-[#b08d4b]/10 hover:text-[#b08d4b] text-slate-700 text-[10px] font-bold rounded-lg transition-colors"
                >
                  Reminder
                </button>
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-grow overflow-y-auto p-3 flex flex-col gap-3 bg-slate-50/50 rounded-xl border border-slate-100 mb-3">
              {clientMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                  <Sparkles size={24} className="text-slate-300" />
                  <p className="text-xs font-mono">No message history yet. Type a message below to start.</p>
                </div>
              ) : (
                clientMessages.map((m, idx) => {
                  const isAdmin = m.sender === "admin";
                  return (
                    <div
                      key={m.id || idx}
                      className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-[10px] font-bold text-slate-600">
                          {isAdmin ? "SK Studio Admin" : (m.senderName || "Client")}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">
                          {new Date(m.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                        isAdmin 
                          ? "bg-[#b08d4b] text-white rounded-tr-none font-medium" 
                          : "bg-white border border-slate-200 text-slate-900 rounded-tl-none font-medium"
                      }`}>
                        {m.body}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Composer */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Type a reply to ${headerDisplayName}...`}
                className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#b08d4b] font-medium"
              />
              <button
                onClick={handleSendMessage}
                disabled={isSending || !chatInput.trim()}
                className="bg-[#b08d4b] hover:bg-[#96753a] disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 shrink-0"
              >
                <span>Send</span>
                <Send size={13} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
            <MessageSquare size={32} className="text-slate-300" />
            <p className="text-xs font-mono">Select a client conversation from the left to view messages</p>
          </div>
        )}

      </div>

    </div>
  );
}
