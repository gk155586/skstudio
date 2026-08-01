"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, CheckCircle2, Clock3, Sparkles, LogOut, Bell, MessageSquare,
  Calendar, User, Camera, Plus, Home, Settings, ChevronRight, Phone
} from "lucide-react";
import ClientChatModal from "@/components/ClientChatModal";

interface BookingSummary {
  id: string;
  name: string;
  email: string;
  service: string;
  date: string;
  status: string;
  phone?: string;
  photographer?: string;
  price?: number;
  advancePaid?: number;
  balanceDue?: number;
}

type TabKey = "bookings" | "messages" | "profile";

export default function BookingsPage() {
  const router = useRouter();
  const [session, setSession] = useState<any | null>(null);
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("bookings");

  // Messaging & Notification state
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  // Check auth and fetch bookings
  useEffect(() => {
    const checkAuthAndFetchBookings = async () => {
      try {
        const meResponse = await fetch("/api/auth/me");
        if (!meResponse.ok) {
          router.push("/login");
          return;
        }

        const meData = await meResponse.json();
        if (meData.success && meData.user) {
          setSession(meData.user);

          // Fetch user bookings
          const bookingsResponse = await fetch("/api/bookings");
          const bookingsData = await bookingsResponse.json();

          if (bookingsData.success) {
            setBookings(bookingsData.bookings || []);
          } else {
            setError("Failed to load bookings");
          }
        }
      } catch (err) {
        console.error("Error:", err);
        setError("An error occurred");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchBookings();
  }, [router]);

  // Periodically check for unread messages from admin
  const fetchUnreadCount = async () => {
    try {
      const res = await fetch("/api/messages?markRead=false");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setUnreadCount(data.unreadCount || 0);
        }
      }
    } catch (err) {}
  };

  useEffect(() => {
    if (!session) return;
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 5000);

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource("/api/public/events");
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "data_changed" || data.type === "message_received") {
            fetchUnreadCount();
          }
        } catch (e) {}
      };
    } catch (e) {}

    return () => {
      clearInterval(interval);
      if (eventSource) eventSource.close();
    };
  }, [session]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    }
    document.cookie = "sk_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "sk_session_jwt=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/";
  };

  const confirmedCount = bookings.filter(b => b.status === "confirmed").length;
  const pendingCount = bookings.filter(b => b.status === "pending").length;
  const completedCount = bookings.filter(b => b.status === "completed").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
      case "pending": return "bg-amber-500/10 text-amber-700 border-amber-500/20";
      case "completed": return "bg-sky-500/10 text-sky-700 border-sky-500/20";
      case "cancelled": return "bg-rose-500/10 text-rose-600 border-rose-500/20";
      default: return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 animate-spin">
            <Camera size={32} className="mx-auto text-[var(--accent)]" />
          </div>
          <p className="text-gray-600 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">

      {/* ─── Top Navigation Bar ─── */}
      <div className="sticky top-0 z-50 bg-[var(--card-bg)]/95 backdrop-blur-xl border-b border-[var(--card-border)] px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-[var(--accent)] transition-colors font-mono uppercase tracking-wider">
            <ArrowLeft size={14} /> Home
          </Link>

          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <button
              onClick={() => { setIsChatOpen(true); setUnreadCount(0); }}
              className="relative p-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--background)] hover:border-[var(--accent)] transition-all"
              title="Studio Messages"
            >
              <Bell size={16} className={unreadCount > 0 ? "text-rose-500 animate-bounce" : "text-gray-500"} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-600 text-white font-bold font-mono text-[9px] rounded-full flex items-center justify-center border-2 border-[var(--card-bg)] animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User Avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-[var(--card-border)]">
              <div className="w-8 h-8 rounded-full bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--accent)] font-bold text-xs flex items-center justify-center">
                {(session?.name || session?.email || "U")[0].toUpperCase()}
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-xs font-bold text-[var(--foreground)] leading-tight">{session?.name || "Client"}</span>
                <span className="text-[10px] text-gray-500 font-mono leading-tight">{session?.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="max-w-5xl mx-auto px-4 py-6 pb-28">

        {/* ─── Profile Card ─── */}
        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 shadow-lg mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent)]/60 text-black font-black text-xl flex items-center justify-center shadow-lg">
                {(session?.name || session?.email || "U")[0].toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold font-display">{session?.name || "Client"}</h1>
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
                    {session?.role === "admin" ? "Admin" : "Client"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{session?.email}</p>
                {session?.phone && (
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Phone size={10} /> {session.phone}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => { setActiveTab("messages"); setIsChatOpen(true); }}
                className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black transition-all"
              >
                <MessageSquare size={14} /> Chat with Studio
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 text-xs px-3.5 py-2.5 rounded-xl text-gray-500 hover:text-rose-600 hover:bg-rose-500/10 border border-transparent hover:border-rose-200 transition-all"
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          </div>
        </div>

        {/* ─── Stats Grid ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total", value: bookings.length, icon: <Calendar size={16} />, color: "text-[var(--accent)]", bg: "bg-[var(--accent)]/10" },
            { label: "Confirmed", value: confirmedCount, icon: <CheckCircle2 size={16} />, color: "text-emerald-600", bg: "bg-emerald-500/10" },
            { label: "Pending", value: pendingCount, icon: <Clock3 size={16} />, color: "text-amber-600", bg: "bg-amber-500/10" },
            { label: "Completed", value: completedCount, icon: <Sparkles size={16} />, color: "text-sky-600", bg: "bg-sky-500/10" },
          ].map((stat, i) => (
            <div key={i} className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4 shadow-sm">
              <div className={`w-8 h-8 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-2`}>
                {stat.icon}
              </div>
              <span className="text-2xl font-black text-[var(--foreground)]">{stat.value}</span>
              <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ─── Bookings List ─── */}
        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--card-border)] flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold font-display">Your Bookings</h2>
              <p className="text-[11px] text-gray-500 mt-0.5">Photography session requests & status</p>
            </div>
            <Link
              href="/#contact"
              className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-[var(--accent)] text-black hover:opacity-90 transition-all shadow-sm"
            >
              <Plus size={14} /> New Booking
            </Link>
          </div>

          {error && (
            <div className="mx-5 mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600">
              {error}
            </div>
          )}

          {bookings.length === 0 ? (
            <div className="p-12 text-center">
              <Camera size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-500 font-medium">No bookings yet</p>
              <p className="text-xs text-gray-400 mt-1">Create your first booking to get started!</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--card-border)]">
              {bookings.map((booking) => (
                <div key={booking.id} className="px-5 py-4 hover:bg-[var(--background)]/50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Service icon */}
                      <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] flex items-center justify-center shrink-0 mt-0.5">
                        <Camera size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-[var(--foreground)] truncate">{booking.service}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-2">
                          <span className="flex items-center gap-1"><Calendar size={10} /> {booking.date}</span>
                          {booking.photographer && (
                            <span className="flex items-center gap-1"><User size={10} /> {booking.photographer}</span>
                          )}
                        </p>
                        {(booking.price != null && booking.price > 0) && (
                          <p className="text-[10px] text-gray-400 mt-1 font-mono">
                            ₹{booking.price?.toLocaleString("en-IN")}
                            {booking.advancePaid ? ` · Advance: ₹${booking.advancePaid.toLocaleString("en-IN")}` : ""}
                            {booking.balanceDue ? ` · Due: ₹${booking.balanceDue.toLocaleString("en-IN")}` : ""}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>

                      {/* Three dot menu */}
                      <label className="event-wrapper">
                        <input type="checkbox" className="event-wrapper-inp" defaultChecked={true} />
                        <div className="bar">
                          <span className="top bar-list"></span>
                          <span className="middle bar-list"></span>
                          <span className="bottom bar-list"></span>
                        </div>
                        <section className="menu-container">
                          <div className="menu-list" onClick={() => alert(`View details for ${booking.service}`)}>View Details</div>
                          <div className="menu-list" onClick={() => { setIsChatOpen(true); }}>Message Studio</div>
                          <div style={{ color: "crimson" }} className="menu-list" onClick={() => alert(`Cancel request sent for booking ID: ${booking.id}`)}>Cancel Booking</div>
                        </section>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Bottom Tab Bar ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--card-bg)]/95 backdrop-blur-xl border-t border-[var(--card-border)] px-4 py-2 shadow-2xl">
        <div className="max-w-5xl mx-auto flex items-center justify-around">
          {[
            { key: "bookings" as TabKey, label: "Bookings", icon: <Calendar size={18} /> },
            { key: "messages" as TabKey, label: "Messages", icon: <MessageSquare size={18} />, badge: unreadCount },
            { key: "profile" as TabKey, label: "Profile", icon: <User size={18} /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                if (tab.key === "messages") { setIsChatOpen(true); setUnreadCount(0); }
              }}
              className={`relative flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all ${
                activeTab === tab.key
                  ? "text-[var(--accent)]"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.icon}
              <span className="text-[9px] font-bold uppercase tracking-wider">{tab.label}</span>
              {tab.badge != null && tab.badge > 0 && (
                <span className="absolute -top-0.5 right-1 min-w-[16px] h-[16px] px-1 bg-rose-600 text-white font-bold font-mono text-[8px] rounded-full flex items-center justify-center animate-pulse">
                  {tab.badge}
                </span>
              )}
              {activeTab === tab.key && (
                <div className="absolute -bottom-2 w-6 h-0.5 rounded-full bg-[var(--accent)]" />
              )}
            </button>
          ))}
        </div>
      </div>



      {/* Authenticated Client Chat Modal */}
      <ClientChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        userSession={session}
        onMessagesRead={() => setUnreadCount(0)}
      />
    </div>
  );
}
