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

  // Poll & listen to real-time SSE stream for admin responses
  useEffect(() => {
    if (!guestId) return;

    fetchWidgetMessages(isOpen);
    const interval = setInterval(() => fetchWidgetMessages(isOpen), 3000);

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
          --cw-bg: #1b1a18;
          --cw-bg-raised: #232120;
          --cw-ink: #ede7da;
          --cw-ink-dim: #b7b0a1;
          --cw-line: rgba(237, 231, 218, 0.12);
          --cw-accent: #c1442d;
          --cw-accent-bright: #e0603f;
          --cw-brass: #b8925b;
        }
        .chat-toggle {
          position: fixed;
          bottom: 26px;
          right: 26px;
          width: 58px;
          height: 58px;
          border-radius: 50%;
          background: var(--cw-accent);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 150;
          border: none;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
          transition: transform 0.2s ease, background 0.2s ease;
        }
        .chat-toggle:hover {
          transform: scale(1.05);
          background: var(--cw-accent-bright);
        }
        .chat-toggle .dot {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 18px;
          height: 18px;
          background: var(--cw-brass);
          border-radius: 50%;
          font-size: 0.65rem;
          font-weight: bold;
          color: var(--cw-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: monospace;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
          border: 2px solid var(--cw-bg);
        }
        .chat-panel {
          position: fixed;
          bottom: 96px;
          right: 26px;
          width: 340px;
          max-width: calc(100vw - 40px);
          height: 440px;
          background: var(--cw-bg-raised);
          border: 1px solid var(--cw-line);
          display: none;
          flex-direction: column;
          z-index: 150;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
          font-family: 'Inter', sans-serif;
          border-radius: 16px;
          overflow: hidden;
        }
        .chat-panel.open {
          display: flex;
        }
        .chat-head {
          padding: 16px 18px;
          border-bottom: 1px solid var(--cw-line);
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: var(--cw-ink);
          background: var(--cw-bg);
        }
        .chat-head .who {
          font-size: 0.9rem;
          font-weight: 600;
        }
        .chat-head .status {
          font-size: 0.72rem;
          color: var(--cw-brass);
        }
        .chat-head button {
          background: none;
          border: none;
          color: var(--cw-ink-dim);
          font-size: 1.2rem;
          cursor: pointer;
        }
        .chat-body {
          flex: 1;
          overflow-y: auto;
          padding: 16px 18px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .msg {
          max-width: 82%;
          padding: 9px 13px;
          font-size: 0.86rem;
          border-radius: 8px;
          line-height: 1.4;
          word-break: break-word;
        }
        .msg.admin {
          background: var(--cw-bg);
          align-self: flex-start;
          color: var(--cw-ink-dim);
          border: 1px solid var(--cw-line);
        }
        .msg.user {
          background: var(--cw-accent);
          align-self: flex-end;
          color: #f6f1e7;
        }
        .msg .time {
          display: block;
          font-size: 0.62rem;
          margin-top: 4px;
          opacity: 0.6;
          font-family: monospace;
        }
        .chat-input {
          display: flex;
          border-top: 1px solid var(--cw-line);
          background: var(--cw-bg);
        }
        .chat-input input {
          flex: 1;
          background: none;
          border: none;
          color: var(--cw-ink);
          padding: 14px;
          font-family: inherit;
          font-size: 0.86rem;
        }
        .chat-input input:focus {
          outline: none;
        }
        .chat-input button {
          background: none;
          border: none;
          color: var(--cw-brass);
          padding: 0 16px;
          cursor: pointer;
          font-size: 1rem;
        }
      `}</style>

      {/* Round Floating Toggle Button */}
      <button className="chat-toggle" onClick={toggleChat} aria-label="Open studio live chat">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f6f1e7" strokeWidth="2">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
        {unreadCount > 0 && <span className="dot" id="chatDot">{unreadCount}</span>}
      </button>

      {/* Floating Chat Panel Window */}
      <div className={`chat-panel ${isOpen ? "open" : ""}`} id="chatPanel">
        <div className="chat-head">
          <div>
            <div className="who">SK Photo Studio Pune</div>
            <div className="status">● LIVE SUPPORT ONLINE</div>
          </div>
          <button onClick={toggleChat} aria-label="Close chat">×</button>
        </div>

        <div className="chat-body" id="chatBody" ref={chatBodyRef}>
          {messages.length === 0 ? (
            <div className="msg admin">
              Hi! Welcome to SK Photo Studio Pune. Ask us anything about bookings, maternity/baby shoots, or photography packages!
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
            placeholder="Type a message…"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={handleSend} aria-label="Send message">
            ➤
          </button>
        </div>
      </div>
    </>
  );
}
