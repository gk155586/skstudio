"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { MessageSquare, X, Send, Phone, User, Check, ExternalLink } from "lucide-react";

export default function FloatingChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [guestId, setGuestId] = useState<string>("");
  const [isSending, setIsSending] = useState(false);

  // Guest contact form states
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [hasSavedContact, setHasSavedContact] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);

  const chatBodyRef = useRef<HTMLDivElement | null>(null);

  // Initialize guest identifier & saved contact info
  useEffect(() => {
    let gid = localStorage.getItem("sk_guest_chat_id");
    if (!gid) {
      gid = "guest_" + Math.random().toString(36).substring(2, 8) + "_" + Date.now();
      localStorage.setItem("sk_guest_chat_id", gid);
    }
    setGuestId(gid);

    const savedName = localStorage.getItem("sk_chat_name") || "";
    const savedPhone = localStorage.getItem("sk_chat_phone") || "";
    if (savedName || savedPhone) {
      setContactName(savedName);
      setContactPhone(savedPhone);
      setHasSavedContact(true);
    }
  }, []);

  // Fetch messages from backend
  const fetchWidgetMessages = React.useCallback(async (markRead = false) => {
    if (!guestId) return;
    try {
      const res = await fetch(`/api/public/messages?guestId=${encodeURIComponent(guestId)}${markRead ? "&markRead=true" : ""}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setMessages(data.messages || []);
          if (!markRead) {
            setUnreadCount(data.unreadCount || 0);
          } else {
            setUnreadCount(0);
          }
        }
      }
    } catch (e) {}
  }, [guestId]);

  // Poll every 15 seconds
  useEffect(() => {
    if (!guestId) return;

    fetchWidgetMessages(isOpen);
    const interval = setInterval(() => fetchWidgetMessages(isOpen), 15000);

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource("/api/public/events");
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "data_changed" || data.type === "message_received") {
            fetchWidgetMessages(isOpen);
          }
        } catch (err) {}
      };
    } catch (err) {}

    return () => {
      clearInterval(interval);
      if (eventSource) eventSource.close();
    };
  }, [guestId, isOpen, fetchWidgetMessages]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      chatBodyRef.current?.scrollTo({ top: chatBodyRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const toggleChat = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      setUnreadCount(0);
      fetchWidgetMessages(true);
    }
  };

  const saveContactInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactPhone.trim() && !contactName.trim()) return;
    localStorage.setItem("sk_chat_name", contactName.trim());
    localStorage.setItem("sk_chat_phone", contactPhone.trim());
    setHasSavedContact(true);
    setShowContactForm(false);

    // Send automated system notification with details
    if (inputVal.trim() === "") {
      setInputVal(`My Name: ${contactName.trim()} | Mobile: ${contactPhone.trim()}`);
    }
  };

  const handleSend = async () => {
    if (!inputVal.trim() || isSending || !guestId) return;
    const textToSend = inputVal.trim();
    setInputVal("");
    setIsSending(true);

    const tempMsg = {
      id: "temp-" + Date.now(),
      sender: "user",
      senderName: contactName ? `${contactName} (Ph: ${contactPhone})` : "You",
      body: textToSend,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await fetch("/api/public/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestId,
          messageText: textToSend,
          name: contactName.trim(),
          phone: contactPhone.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.reply) {
          setMessages((prev) => [...prev, data.reply]);
        } else {
          fetchWidgetMessages(isOpen);
        }
      }
    } catch (e) {
      console.error("Widget message send error:", e);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Hide global floating widget on user dashboard (/bookings) and admin pages (/admin)
  if (pathname?.startsWith("/bookings") || pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <style jsx global>{`
        :root {
          --cw-bg: #141414;
          --cw-bg-raised: #1e1e1e;
          --cw-ink: #f5f5f5;
          --cw-ink-dim: #a3a3a3;
          --cw-line: rgba(255, 255, 255, 0.12);
          --cw-accent: #d1b06c;
          --cw-gold: #d1b06c;
        }
        .chat-toggle-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 99999 !important;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .chat-toggle-pill {
          background: #1e1e1e;
          color: #f5f5f5;
          border: 1px solid var(--cw-accent);
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          box-shadow: 0 4px 14px rgba(0,0,0,0.5);
          letter-spacing: 0.05em;
          white-space: nowrap;
          pointer-events: none;
          animation: floatPulse 3s infinite ease-in-out;
        }
        @keyframes floatPulse {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .chat-toggle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #d1b06c 0%, #a68443 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: 2px solid rgba(255,255,255,0.2);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5), 0 0 15px rgba(209, 176, 108, 0.4);
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          color: #000000;
        }
        .chat-toggle:hover {
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 10px 30px rgba(209, 176, 108, 0.6);
        }
        .chat-toggle .dot {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 22px;
          height: 22px;
          background: #ef4444;
          border-radius: 50%;
          font-size: 0.7rem;
          font-weight: 800;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: monospace;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
          border: 2px solid #000000;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        .chat-panel {
          position: fixed;
          bottom: 96px;
          right: 24px;
          width: 360px;
          max-width: calc(100vw - 32px);
          height: 520px;
          background: var(--cw-bg-raised);
          border: 1px solid var(--cw-accent);
          display: none;
          flex-direction: column;
          z-index: 99999 !important;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
          font-family: 'Inter', sans-serif;
          border-radius: 24px;
          overflow: hidden;
          backdrop-filter: blur(16px);
        }
        .chat-panel.open {
          display: flex;
        }
        .chat-head {
          padding: 14px 18px;
          border-bottom: 1px solid var(--cw-line);
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: var(--cw-ink);
          background: var(--cw-bg);
        }
        .chat-head .who {
          font-size: 0.9rem;
          font-weight: 800;
          color: var(--cw-accent);
          letter-spacing: 0.02em;
        }
        .chat-head .status {
          font-size: 0.7rem;
          color: #10b981;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 2px;
        }
        .chat-head button {
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--cw-line);
          color: var(--cw-ink);
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .chat-head button:hover {
          background: rgba(255,255,255,0.15);
          color: #fff;
        }
        .chat-body {
          flex: 1;
          overflow-y: auto;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: #141414;
        }
        .msg {
          max-width: 84%;
          padding: 10px 14px;
          font-size: 0.85rem;
          border-radius: 14px;
          line-height: 1.45;
          word-break: break-word;
        }
        .msg.admin {
          background: #232323;
          align-self: flex-start;
          color: #e5e5e5;
          border: 1px solid rgba(255,255,255,0.08);
          border-bottom-left-radius: 2px;
        }
        .msg.user {
          background: linear-gradient(135deg, #d1b06c 0%, #b8925b 100%);
          align-self: flex-end;
          color: #000000;
          font-weight: 600;
          border-bottom-right-radius: 2px;
        }
        .msg .time {
          display: block;
          font-size: 0.6rem;
          margin-top: 4px;
          opacity: 0.7;
          font-family: monospace;
        }
        .chat-input {
          display: flex;
          border-top: 1px solid var(--cw-line);
          background: var(--cw-bg-raised);
          padding: 8px 12px;
          align-items: center;
          gap: 8px;
        }
        .chat-input input {
          flex: 1;
          background: #141414;
          border: 1px solid var(--cw-line);
          border-radius: 20px;
          color: var(--cw-ink);
          padding: 10px 16px;
          font-family: inherit;
          font-size: 0.85rem;
        }
        .chat-input input:focus {
          outline: none;
          border-color: var(--cw-accent);
        }
        .chat-input button {
          background: var(--cw-accent);
          border: none;
          color: #000000;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s;
          shrink: 0;
        }
        .chat-input button:hover {
          transform: scale(1.08);
        }
      `}</style>

      {/* Floating Toggle Button */}
      <div className="chat-toggle-container">
        {!isOpen && (
          <div className="chat-toggle-pill hidden sm:block">
            💬 Chat with Studio
          </div>
        )}
        <button className="chat-toggle" onClick={toggleChat} aria-label="Open studio live chat">
          {isOpen ? (
            <X size={26} strokeWidth={2.5} color="#000000" />
          ) : (
            <MessageSquare size={26} strokeWidth={2.5} color="#000000" />
          )}
          {unreadCount > 0 && <span className="dot" id="chatDot">{unreadCount}</span>}
        </button>
      </div>

      {/* Floating Chat Panel */}
      <div className={`chat-panel ${isOpen ? "open" : ""}`} id="chatPanel">
        <div className="chat-head">
          <div>
            <div className="who">SK Photo Studio Pune</div>
            <div className="status">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              Live Studio Assistant
            </div>
          </div>
          <button onClick={toggleChat} aria-label="Close chat">
            <X size={18} />
          </button>
        </div>

        {/* Lead Capture Banner for Guests */}
        {(!hasSavedContact || showContactForm) ? (
          <form onSubmit={saveContactInfo} className="bg-[#1e1e1e] border-b border-[var(--cw-line)] p-3 flex flex-col gap-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--cw-accent)] flex items-center justify-between">
              <span>📱 Share Contact for Callback & Prices:</span>
              {hasSavedContact && (
                <button type="button" onClick={() => setShowContactForm(false)} className="text-gray-400 hover:text-white">
                  <X size={12} />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1.5 bg-[#141414] border border-[var(--cw-line)] rounded-xl px-2.5 py-1.5 text-xs text-white">
                <User size={12} className="text-[var(--cw-accent)]" />
                <input
                  type="text"
                  placeholder="Your Name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full bg-transparent outline-none text-xs"
                />
              </div>
              <div className="flex items-center gap-1.5 bg-[#141414] border border-[var(--cw-line)] rounded-xl px-2.5 py-1.5 text-xs text-white">
                <Phone size={12} className="text-[var(--cw-accent)]" />
                <input
                  type="tel"
                  placeholder="Mobile No."
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full bg-transparent outline-none text-xs"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-1.5 bg-[var(--cw-accent)] text-black font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition hover:opacity-90 flex items-center justify-center gap-1"
            >
              <Check size={12} /> Save Contact Info
            </button>
          </form>
        ) : (
          <div className="bg-[#1a1a1a] border-b border-[var(--cw-line)] px-3 py-1.5 flex items-center justify-between text-[11px] text-gray-300">
            <div className="flex items-center gap-1.5 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span className="truncate">Contact: <strong>{contactName || "Guest"}</strong> ({contactPhone || "Saved"})</span>
            </div>
            <button onClick={() => setShowContactForm(true)} className="text-[10px] text-[var(--cw-accent)] hover:underline shrink-0 font-mono">
              Edit
            </button>
          </div>
        )}

        <div className="chat-body" id="chatBody" ref={chatBodyRef}>
          {messages.length === 0 ? (
            <div className="msg admin">
              👋 Hello! Welcome to <strong>SK Photo Studio Pune</strong>.<br/><br/>
              How can we assist you today? Feel free to ask about maternity, baby shoots, wedding packages, or custom photo frames!
              <span className="time">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          ) : (
            messages.map((m, idx) => {
              const isAdmin = m.sender === "admin";
              return (
                <div key={m.id || idx} className={`msg ${isAdmin ? "admin" : "user"}`}>
                  {m.body}
                  <span className="time">
                    {new Date(m.timestamp || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Direct WhatsApp Quick Contact Button */}
        <a
          href="https://wa.me/919307112119?text=Hi%20SK%20Photo%20Studio%20Pune,%20I%20am%20inquiring%20about%20photoshoot%20packages."
          target="_blank"
          rel="noopener noreferrer"
          className="mx-3 my-1.5 py-2 bg-emerald-600/20 border border-emerald-500/40 hover:bg-emerald-600 hover:text-white text-emerald-400 text-[11px] font-bold rounded-xl text-center transition-all flex items-center justify-center gap-1.5"
        >
          <Phone size={13} /> Chat Directly on WhatsApp (+91 93071 12119) <ExternalLink size={11} />
        </a>

        <div className="chat-input">
          <input
            id="chatInput"
            type="text"
            placeholder="Type a message..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={handleSend} aria-label="Send message">
            <Send size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </>
  );
}
