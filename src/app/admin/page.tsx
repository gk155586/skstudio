"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Users, Calendar, Award, RefreshCw, ShieldAlert, LogOut, Terminal, Lock,
  Sun, Moon, X, Check, Signature, Settings, Image as ImageIcon, Wand2,
  MessageSquare, CreditCard, UserCog
} from "lucide-react";

// Import modular views
import DashboardView from "@/components/admin/DashboardView";
import BookingsView from "@/components/admin/BookingsView";
import MessagingView from "@/components/admin/MessagingView";
import EnquiriesView from "@/components/admin/EnquiriesView";
import PaymentsView from "@/components/admin/PaymentsView";
import UsersView from "@/components/admin/UsersView";

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isDark, setIsDark] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [dataLoading, setDataLoading] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  // Auth state
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");
  const [session, setSession] = useState<any>(null);

  // Core Data State
  const [bookings, setBookings] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [content, setContent] = useState<any>(null);
  const [crew, setCrew] = useState<string[]>(["Ganesh SK", "Sunil K", "Rohit P"]);
  const [settings, setSettings] = useState<any>({
    studioName: "SK Studio Pune",
    address: "Sakubai Gawali Gardan, Shriram Colony, Bhosari, Maharashtra 411039",
    phone: "+91 93071 12119",
    email: "skstudiopune@gmail.com",
    hours: "Mon - Sun: 9:00 AM - 8:00 PM"
  });

  // UI Control states
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [chatChannel, setChatChannel] = useState<string>("whatsapp");

  // E-Signature Modal States
  const [selectedSignatureBooking, setSelectedSignatureBooking] = useState<string>("");
  const [showSignatureModal, setShowSignatureModal] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  // Mobile sidebar state
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Real-Time Notification & New Message Popup States
  const [newMessagePopup, setNewMessagePopup] = useState<any | null>(null);
  const [toastAlert, setToastAlert] = useState<string | null>(null);

  // Web Audio API Beep alert generator
  const playNotificationBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (err) {}
  };

  // Check auth status on load
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user && data.user.role === "admin") {
            setIsAuthenticated(true);
            setSession(data.user);
            fetchDashboardData();
          }
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 1. Establish SSE Client connection + Hybrid 4-second Polling for 100% Real-Time Delivery
  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Polling fallback every 4 seconds
    const pollTimer = setInterval(() => {
      fetchDashboardData();
    }, 4000);

    // Create EventSource listener for instant push events
    const eventSource = new EventSource("/api/admin/events");
    
    eventSource.addEventListener("data_changed", (e: any) => {
      try {
        const payload = JSON.parse(e.data);
        console.log("[SSE Broadcast] Real-time event received:", payload);

        // Play audio alert
        playNotificationBeep();

        // Check if message received from client
        if (payload.type === "message_received" && payload.data) {
          const msg = payload.data;
          if (msg.sender === "user") {
            setNewMessagePopup({
              id: msg.id,
              senderName: msg.senderName || msg.senderEmail || "Client",
              senderEmail: msg.senderEmail || msg.recipientEmail,
              body: msg.body,
              timestamp: msg.timestamp || new Date().toISOString()
            });
          }
          setToastAlert(`📩 New Message from ${msg.senderName || "Client"}`);
        } else if (payload.type === "booking_created") {
          setToastAlert(`📅 New Booking from ${payload.data?.name || "Client"}`);
        } else if (payload.type === "enquiry_received") {
          setToastAlert(`🖼️ New Enquiry from ${payload.data?.customerName || "Client"}`);
        } else if (payload.type === "new_user") {
          setToastAlert(`👤 New User Registered: ${payload.data?.name || "Client"}`);
        }

        // Auto dismiss toast after 5 seconds
        setTimeout(() => setToastAlert(null), 5000);

        // Refresh telemetry data immediately
        fetchDashboardData();
      } catch (err) {
        console.error("[SSE Broadcast] Failed to parse payload:", err);
      }
    });

    return () => {
      clearInterval(pollTimer);
      eventSource.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Fetch telemetry
  const fetchDashboardData = async () => {
    setDataLoading(true);
    try {
      const response = await fetch(`/api/admin/data?t=${Date.now()}`, { cache: "no-store" });
      const data = await response.json();
      if (data.success) {
        setBookings(data.bookings || []);
        setPackages(data.packages || []);
        setUsers(data.users || []);
        setCoupons(data.coupons || []);
        setOrders(data.orders || []);
        setReviews(data.reviews || []);
        setEnquiries(data.enquiries || []);
        setAuditLogs(data.auditLogs || []);
        setContent(data.content || null);
        if (data.settings) setSettings(data.settings);
        if (data.crew) setCrew(data.crew);
        
        // Load messages separately
        const msgResponse = await fetch(`/api/admin/messages?t=${Date.now()}`, { cache: "no-store" });
        const msgData = await msgResponse.json();
        if (msgData.success) {
          setMessages(msgData.messages || []);
          const uniqClients = Array.from(new Set((msgData.messages || []).map((m: any) => m.recipientEmail))).filter(Boolean);
          if (uniqClients.length > 0 && !selectedClient) {
            setSelectedClient(uniqClients[0] as string);
          }
        }
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setDataLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: username, password }),
      });
      const data = await res.json();
      if (data.success && data.user && data.user.role === "admin") {
        setIsAuthenticated(true);
        setSession(data.user);
        fetchDashboardData();
      } else {
        setLoginError("Verification failed. Credentials rejected.");
      }
    } catch (err) {
      setLoginError("Gateway communication error.");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setIsAuthenticated(false);
      setSession(null);
      setUsername("");
      setPassword("");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const saveTransaction = async (action: string, payload: any) => {
    try {
      const res = await fetch("/api/admin/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, data: payload }),
      });
      const data = await res.json();
      if (data.success) {
        fetchDashboardData();
        return data;
      } else {
        const errorMsg = data.message || data.error || (typeof data === 'string' ? data : JSON.stringify(data));
        alert("Transaction failed: " + errorMsg);
      }
    } catch (e: any) {
      console.error("Failed to commit database update", e);
      alert("Network or Server Error: " + (e.message || "Could not parse response"));
    }
    return null;
  };

  // E-Signature Drawing Helpers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = isDark ? "#d1b06c" : "#b08d4b";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedSignatureBooking) return;
    const signatureData = canvas.toDataURL();
    
    saveTransaction("update_booking", {
      id: selectedSignatureBooking,
      contractSigned: true,
      contractSignature: signatureData
    });
    setShowSignatureModal(false);
    clearCanvas();
    alert("Digital waiver signature logged successfully.");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060606] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/img/logo-light.png"
            alt="SK Studio Pune"
            className="h-16 w-auto object-contain logo-blend animate-pulse"
          />
          <span className="tracking-[0.25em] text-[10px] uppercase text-gray-500 font-mono">SK SECURITY GATEWAY LOADING...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#060606] text-white flex items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-35 z-0" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#d1b06c]/10 opacity-30 blur-[150px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10 border border-[#222222] rounded-3xl p-8 md:p-10 bg-black/60 backdrop-blur-3xl shadow-[0_0_50px_rgba(209,176,108,0.05)]">
          <div className="flex flex-col items-center text-center gap-2 mb-8">
            <div className="p-4 bg-[#d1b06c]/10 border border-[#d1b06c]/20 text-[#d1b06c] rounded-full mb-2">
              <Lock size={28} />
            </div>
            <h1 className="text-xl font-bold tracking-widest uppercase font-display">SK Core Auth Gateway</h1>
            <p className="text-[9px] font-mono tracking-[0.3em] text-gray-500 uppercase">Secure Administrative Session</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            {loginError && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2 font-mono">
                <ShieldAlert size={16} />
                {loginError}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label htmlFor="username" className="text-[10px] uppercase tracking-widest text-gray-400 font-mono">Core Identity (Email)</label>
              <input
                type="email"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ganeshkalapadgk@gmail.com"
                required
                className="w-full bg-black/40 border border-[#222222] focus:border-[#d1b06c] rounded-xl py-3 px-4 focus:outline-none text-white text-sm font-mono transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="passcode" className="text-[10px] uppercase tracking-widest text-gray-400 font-mono">Access Passcode</label>
              <input
                type="password"
                id="passcode"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-black/40 border border-[#222222] focus:border-[#d1b06c] rounded-xl py-3 px-4 focus:outline-none text-white text-sm font-mono transition-colors"
              />
            </div>

            <button
              type="submit"
              className="mt-4 w-full py-4 rounded-xl bg-[#d1b06c] hover:bg-[#c39e58] text-black font-bold text-xs tracking-[0.2em] uppercase transition-all duration-300 shadow-[0_0_20px_rgba(209,176,108,0.15)]"
            >
              Request Access
            </button>
          </form>

          <Link href="/" className="flex items-center justify-center gap-2 mt-6 text-[10px] text-gray-500 hover:text-white uppercase tracking-widest transition-colors font-mono">
            ← Exit to site
          </Link>
        </div>
      </div>
    );
  }

  const sidebarGroups = [
    {
      title: "Overview",
      items: [
        { id: "dashboard", label: "Dashboard", icon: <Award size={16} /> }
      ]
    },
    {
      title: "Business & Clients",
      items: [
        { id: "users", label: "Users & Accounts", icon: <UserCog size={16} /> },
        { id: "bookings", label: "Bookings", icon: <Calendar size={16} /> },
        { id: "enquiries", label: "Enquiries", icon: <Users size={16} /> },
        { id: "messaging", label: "Messages", icon: <MessageSquare size={16} /> },
        { id: "payments", label: "Payments & Invoices", icon: <CreditCard size={16} /> }
      ]
    }
  ];

  const getTabHeader = () => {
    switch (activeTab) {
      case "dashboard":
        return {
          title: "Dashboard Overview",
          desc: "Key performance indicators, recent activity logs, and real-time studio statistics."
        };
      case "users":
        return {
          title: "Users & Accounts Directory",
          desc: "Manage registered client accounts, roles, access permissions, and complete user profiles."
        };
      case "bookings":
        return {
          title: "Bookings Manager",
          desc: "Schedule photography shoots, manage client contracts, e-signatures, and workflow checklists."
        };
      case "enquiries":
        return {
          title: "Enquiries Pipeline",
          desc: "Track client leads, manage service inquiry pipeline stages, and convert leads to confirmed bookings."
        };
      case "messaging":
        return {
          title: "Messages Hub",
          desc: "Direct two-way platform messaging with registered clients."
        };
      case "payments":
        return {
          title: "Payments & Invoices",
          desc: "Track studio revenues, issue client receipts, record invoices, and manage discount promo coupons."
        };
      default:
        return {
          title: "Management Console",
          desc: "Configure and update studio resources."
        };
    }
  };

  return (
    <div className="min-h-screen font-sans flex bg-[#f8f9fa] text-slate-900 light-theme">
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-200 ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar Panel */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen w-64 border-r z-50
        border-slate-200 bg-white
        shadow-sm p-6 flex flex-col gap-8 flex-shrink-0
        transition-transform duration-200 ease-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="flex flex-col items-start gap-1.5 select-none mb-2 ml-2">
          <img
            src="/img/logo-light.png"
            alt="SK Studio"
            className="h-14 w-auto object-contain logo-blend"
          />
          <span className="text-[9px] tracking-[0.25em] font-mono text-[#b08d4b] font-bold uppercase">Admin console</span>
        </div>

        <nav className="flex flex-col gap-5 flex-grow overflow-y-auto pr-1">
          {sidebarGroups.map((group) => (
            <div key={group.title} className="flex flex-col gap-1">
              <span className="text-[10px] tracking-wider uppercase font-bold text-slate-400 mb-1.5 px-3">
                {group.title}
              </span>
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-150 ${
                    activeTab === item.id 
                      ? `bg-[#b08d4b] text-white shadow-sm` 
                      : `text-slate-600 hover:text-slate-900 hover:bg-slate-100`
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl font-bold uppercase tracking-wider transition-colors duration-150"
          >
            <LogOut size={15} />
            Terminate session
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-grow p-6 md:p-8 lg:p-12 w-full relative z-10 min-h-screen">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-5 border-b border-slate-200">
          <div className="flex items-center gap-4">
            {/* Mobile hamburger */}
            <button 
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <Terminal size={16} />
            </button>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] tracking-[0.25em] font-mono text-slate-400 font-bold uppercase">ADMIN CONSOLE</span>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display text-slate-900">{getTabHeader().title}</h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5 hidden md:block">{getTabHeader().desc}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">

            <button 
              onClick={fetchDashboardData}
              className="p-3 rounded-full border border-slate-200 bg-white text-[#b08d4b] hover:scale-105 shadow-sm transition-all duration-150"
            >
              <RefreshCw size={14} className={dataLoading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Tab Modules */}
        {activeTab === "dashboard" && (
          <DashboardView
            isDark={isDark}
            bookings={bookings}
            orders={orders}
            users={users}
            auditLogs={auditLogs}
            enquiries={enquiries}
            messages={messages}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "users" && (
          <UsersView
            isDark={isDark}
            users={users}
            bookings={bookings}
            messages={messages}
            saveTransaction={saveTransaction}
            setSelectedClient={setSelectedClient}
            setActiveTab={setActiveTab}
            fetchDashboardData={fetchDashboardData}
          />
        )}

        {activeTab === "bookings" && (
          <BookingsView
            isDark={isDark}
            bookings={bookings}
            saveTransaction={saveTransaction}
            setSelectedSignatureBooking={setSelectedSignatureBooking}
            setShowSignatureModal={setShowSignatureModal}
            crew={crew}
          />
        )}

        {activeTab === "messaging" && (
          <MessagingView
            isDark={isDark}
            users={users}
            messages={messages}
            selectedClient={selectedClient}
            setSelectedClient={setSelectedClient}
            chatChannel={chatChannel}
            setChatChannel={setChatChannel}
            saveTransaction={saveTransaction}
            fetchDashboardData={fetchDashboardData}
          />
        )}

        {activeTab === "enquiries" && (
          <EnquiriesView
            isDark={isDark}
            enquiries={enquiries}
            saveTransaction={saveTransaction}
            crew={crew}
          />
        )}

        {activeTab === "payments" && (
          <PaymentsView
            isDark={isDark}
            bookings={bookings}
            coupons={coupons}
            saveTransaction={saveTransaction}
          />
        )}

      </main>

      {/* Signature Capture Modal overlay */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-6 z-55 backdrop-blur-sm">
          <div className={`w-full max-w-md border rounded-3xl p-8 relative ${
            isDark ? "bg-[#0c0c0c] border-[#222222] text-white" : "bg-white border-[#EFEFEE] text-[#1c1a17]"
          }`}>
            <button 
              onClick={() => setShowSignatureModal(false)}
              className="absolute top-4 right-4 text-gray-500"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold font-display uppercase text-[#d1b06c] tracking-wider mb-2">Capture Signature Waiver</h3>
            <p className="text-[10px] text-gray-400 mb-6 font-mono">Draw inside the canvas boundary below:</p>

            <div className="border border-gray-800 rounded-2xl bg-white overflow-hidden w-full h-44 relative">
              <canvas
                ref={canvasRef}
                width={400}
                height={176}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="w-full h-full cursor-crosshair text-black"
              />
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={clearCanvas}
                className="flex-grow py-3 border border-gray-800 text-gray-500 hover:text-white hover:border-white transition-all text-xs font-bold uppercase rounded-xl"
              >
                Clear Canvas
              </button>
              <button
                onClick={saveSignature}
                className="flex-grow py-3 bg-[#d1b06c] text-black text-xs font-bold uppercase rounded-xl"
              >
                Save Signature
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification Banner */}
      {toastAlert && (
        <div className="fixed bottom-6 right-6 z-[100] bg-slate-900 text-white border border-[#b08d4b] px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <MessageSquare size={18} className="text-[#b08d4b]" />
          <span className="text-xs font-bold font-mono">{toastAlert}</span>
          <button onClick={() => setToastAlert(null)} className="text-slate-400 hover:text-white ml-2">
            <X size={14} />
          </button>
        </div>
      )}

      {/* REAL-TIME NEW INCOMING MESSAGE POPUP MODAL FOR ADMIN */}
      {newMessagePopup && (
        <div className="fixed inset-0 z-[110] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#b08d4b] rounded-3xl p-6 shadow-2xl w-full max-w-md text-slate-900 relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setNewMessagePopup(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-[#b08d4b]/15 text-[#b08d4b] rounded-2xl animate-pulse">
                <MessageSquare size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono font-bold text-[#b08d4b] uppercase tracking-wider">⚡ Real-Time Client Message</span>
                <h3 className="text-base font-extrabold text-slate-900">{newMessagePopup.senderName}</h3>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl mb-5 text-xs text-slate-700 font-medium leading-relaxed">
              <p className="line-clamp-4 italic">"{newMessagePopup.body}"</p>
              <span className="text-[9px] font-mono text-slate-400 block mt-2">
                Received at: {new Date(newMessagePopup.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setNewMessagePopup(null)}
                className="flex-1 py-3 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  setSelectedClient(newMessagePopup.senderEmail);
                  setActiveTab("messaging");
                  setNewMessagePopup(null);
                }}
                className="flex-1 py-3 bg-[#b08d4b] hover:bg-[#96753a] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                Open Thread <Wand2 size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
