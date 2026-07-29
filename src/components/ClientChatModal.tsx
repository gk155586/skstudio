"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, X, MessageSquare, Sparkles, CheckCheck, RefreshCw } from "lucide-react";

interface ClientChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  userSession: any;
  onMessagesRead?: () => void;
}

export default function ClientChatModal({
  isOpen,
  onClose,
  userSession,
  onMessagesRead
}: ClientChatModalProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const fetchUserMessages = async (markRead = true) => {
    try {
      const res = await fetch(`/api/messages?markRead=${markRead}&t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setMessages(data.messages || []);
          if (markRead && onMessagesRead) {
            onMessagesRead();
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch client chat messages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUserMessages(true);
      const interval = setInterval(() => {
        fetchUserMessages(true);
      }, 3000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if (!input.trim() || sending) return;
    const textToSend = input.trim();
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageText: textToSend }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        fetchUserMessages(true);
      }
    } catch (err) {
      console.error("Failed to send client message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[var(--card-bg)] text-[var(--foreground)] border border-[var(--card-border)] rounded-3xl w-full max-w-lg h-[600px] shadow-2xl flex flex-col overflow-hidden relative font-sans">
        
        {/* Header */}
        <div className="p-4 border-b border-[var(--card-border)] bg-[var(--background)]/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)]">
              <MessageSquare size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold font-display flex items-center gap-1.5">
                SK Studio Support <Sparkles size={13} className="text-[var(--accent)]" />
              </span>
              <span className="text-[10px] font-mono text-gray-500">Live 2-Way Booking Assistance</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchUserMessages(true)}
              className="p-2 text-gray-400 hover:text-[var(--accent)] transition-colors rounded-full"
              title="Refresh chat"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-full bg-[var(--background)] border border-[var(--card-border)]"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-[var(--background)]/30">
          {loading && messages.length === 0 ? (
            <div className="my-auto text-center text-xs font-mono text-gray-400">Loading conversation history...</div>
          ) : messages.length === 0 ? (
            <div className="my-auto text-center flex flex-col items-center gap-2 p-6">
              <div className="p-3 bg-[var(--accent)]/10 rounded-full text-[var(--accent)]">
                <MessageSquare size={24} />
              </div>
              <h4 className="text-sm font-bold">No Messages Yet</h4>
              <p className="text-xs text-gray-500 max-w-xs text-center">
                Send a message below to ask about your booking, backdrop options, or custom shoot arrangements!
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isAdmin = msg.sender === "admin";

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[85%] rounded-2xl p-3.5 text-xs shadow-sm ${
                    isAdmin
                      ? "self-start bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] rounded-bl-none"
                      : "self-end bg-[var(--accent)] text-black font-medium rounded-br-none"
                  }`}
                >
                  <div className={`flex justify-between items-center gap-3 mb-1 text-[9px] font-mono ${isAdmin ? "text-gray-400" : "text-black/70 font-bold"}`}>
                    <span>{isAdmin ? "SK Studio Admin" : "You"}</span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <p className="whitespace-pre-line leading-relaxed">{msg.body}</p>

                  {!isAdmin && (
                    <div className="flex justify-end mt-1 text-[9px] text-black/60 font-mono">
                      <CheckCheck size={12} />
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-[var(--card-border)] bg-[var(--card-bg)] flex items-center gap-2">
          <input
            type="text"
            placeholder="Type your message to studio coordinator..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-[var(--background)] border border-[var(--card-border)] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[var(--accent)] text-[var(--foreground)] font-medium"
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || sending}
            className="px-4 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-black font-bold text-xs uppercase tracking-wider rounded-xl disabled:opacity-40 transition-all shrink-0 flex items-center gap-1.5"
          >
            {sending ? "Sending..." : "Send"} <Send size={13} />
          </button>
        </div>

      </div>
    </div>
  );
}
