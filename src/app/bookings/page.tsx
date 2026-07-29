"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock3, Sparkles, LogOut, Bell, MessageSquare } from "lucide-react";
import ClientChatModal from "@/components/ClientChatModal";

interface BookingSummary {
  id: string;
  name: string;
  email: string;
  service: string;
  date: string;
  status: string;
  phone?: string;
}

export default function BookingsPage() {
  const router = useRouter();
  const [session, setSession] = useState<any | null>(null);
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    const interval = setInterval(fetchUnreadCount, 3000);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 animate-spin">
            <Sparkles size={32} className="mx-auto" />
          </div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-6 py-16">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        
        {/* Top Header Actions (Only rendered for logged-in user session) */}
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[var(--accent)] transition-colors">
            <ArrowLeft size={16} /> Back to Home
          </Link>

          <div className="flex items-center gap-3">
            {/* Authenticated Notification Bell & Unread Messages Button */}
            <button
              onClick={() => {
                setIsChatOpen(true);
                setUnreadCount(0);
              }}
              className="relative inline-flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black transition-all shadow-sm"
              title="Open Chat & Notifications"
            >
              <Bell size={16} className={unreadCount > 0 ? "animate-bounce text-rose-500" : ""} />
              <span>Studio Messages</span>

              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 bg-rose-600 text-white font-bold font-mono text-[10px] rounded-full flex items-center justify-center border-2 border-[var(--background)] shadow-md animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 text-sm px-3.5 py-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        {/* Dashboard Card */}
        <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] p-8 shadow-2xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/10 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-[var(--accent)]">
                <Sparkles size={14} /> Client Journey
              </div>
              <h1 className="mt-3 text-3xl font-bold font-display">Your Booking Dashboard</h1>
              <p className="mt-2 text-sm text-gray-600">
                Welcome back, {session?.name || session?.email}. View and manage your bookings here.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsChatOpen(true)}
                className="rounded-full border border-[var(--card-border)] bg-[var(--background)] px-5 py-3 text-sm font-semibold hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all flex items-center gap-2"
              >
                <MessageSquare size={16} className="text-[var(--accent)]" /> Chat with Admin
              </button>
              <Link href="/#contact" className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[var(--accent-hover)]">
                + New Booking
              </Link>
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--background)] p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--accent)]">
                <CheckCircle2 size={16} /> Total Bookings
              </div>
              <p className="mt-3 text-2xl font-semibold">{bookings.length}</p>
              <p className="mt-2 text-sm text-gray-600">Your photography session requests</p>
            </div>
            <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--background)] p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--accent)]">
                <Clock3 size={16} /> Next Step
              </div>
              <p className="mt-3 text-2xl font-semibold">Call & Plan</p>
              <p className="mt-2 text-sm text-gray-600">We'll connect with you to finalize details</p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-[var(--card-border)] bg-[var(--background)] p-6">
            <h2 className="text-xl font-semibold">Your Bookings</h2>
            {bookings.length === 0 ? (
              <p className="mt-3 text-sm text-gray-600">No bookings yet. Create a new booking to get started!</p>
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                {bookings.map((booking) => (
                  <div key={booking.id} className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 relative shadow-md">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-base text-[var(--foreground)]">{booking.service}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{booking.name} • {booking.phone || "Phone Not Provided"}</p>
                      </div>

                      {/* Interactive Animated Action Button */}
                      <label className="event-wrapper">
                        <input type="checkbox" className="event-wrapper-inp" defaultChecked={true} />
                        <div className="bar">
                          <span className="top bar-list"></span>
                          <span className="middle bar-list"></span>
                          <span className="bottom bar-list"></span>
                        </div>
                        <section className="menu-container">
                          <div className="menu-list" onClick={() => alert(`Edit session request for ${booking.service}`)}>Edit</div>
                          <div className="menu-list" onClick={() => alert(`Repost booking for ${booking.service}`)}>Repost</div>
                          <div style={{ color: "crimson" }} className="menu-list" onClick={() => alert(`Delete request sent for booking ID: ${booking.id}`)}>Delete</div>
                        </section>
                      </label>
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-3 border-t border-[var(--card-border)] text-xs">
                      <div className="text-gray-500 font-mono">Date: {booking.date}</div>
                      <div className="font-mono font-bold uppercase tracking-wider text-[var(--accent)] px-2.5 py-0.5 bg-[var(--accent)]/10 rounded-full border border-[var(--accent)]/20">
                        {booking.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
