"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Sparkles } from "lucide-react";

export default function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [guestId, setGuestId] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const chatBodyRef = useRef<HTMLDivElement | null>(null);

  // Initialize persistent guest identifier in localStorage if not logged in
  useEffect(() => {
    let gid = localStorage.getItem("sk_guest_chat_id");
    if (!gid) {
      gid = "guest_" + Math.random().toString(36).substring(2, 8) + "_" + Date.now();
      localStorage.setItem("sk_guest_chat_id", gid);
    }
    setGuestId(gid);
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

  // Poll every 15 seconds to stay lightweight while listening to real-time events
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

  const handleSend = async () => {
    if (!inputVal.trim() || isSending || !guestId) return;
    const textToSend = inputVal.trim();
    setInputVal("");
    setIsSending(true);

    // Optimistic UI insert
    const tempMsg = {
      id: "temp-" + Date.now(),
      sender: "user",
      senderName: "You",
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
        }),
      });

      if (res.ok) {
        fetchWidgetMessages(isOpen);
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
          --cw-accent-bright: #e5c889;
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
          height: 480px;
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
          padding: 16px 20px;
          border-bottom: 1px solid var(--cw-line);
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: var(--cw-ink);
          background: var(--cw-bg);
        }
        .chat-head .who {
          font-size: 0.95rem;
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
          width: 32px;
          height: 32px;
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
          padding: 16px 18px;
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

      {/* Floating Toggle Button Container */}
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

      {/* Floating Chat Panel Window */}
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
