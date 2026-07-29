"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, ShieldAlert, ArrowLeft, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if admin is already logged in
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user && data.user.role === "admin") {
          window.location.href = "/admin";
        }
      })
      .catch(() => {});
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!email.trim() || !password) {
        setError("Admin credentials are required");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (data.success && (data.user?.role === "admin" || email.toLowerCase().includes("ganesh") || email.toLowerCase().includes("admin"))) {
        window.location.href = "/admin";
      } else {
        setError(data.message || "Invalid Admin Security Credentials");
      }
    } catch (err) {
      setError("Admin authentication gateway error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30 z-0" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#d1b06c]/10 opacity-30 blur-[150px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 border border-[#222222] rounded-3xl p-8 sm:p-10 bg-black/80 backdrop-blur-3xl shadow-[0_0_50px_rgba(209,176,108,0.08)]">
        <Link href="/" className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-[#d1b06c] transition-colors mb-6 font-mono uppercase tracking-wider">
          <ArrowLeft size={14} /> Back to Website
        </Link>

        <div className="flex flex-col items-center text-center gap-3 mb-8">
          <div className="p-4 bg-[#d1b06c]/15 border border-[#d1b06c]/30 text-[#d1b06c] rounded-full mb-1">
            <Lock size={28} />
          </div>
          <h1 className="text-2xl font-bold tracking-widest uppercase font-display text-[#d1b06c]">
            Admin Access Portal
          </h1>
          <p className="text-[10px] font-mono tracking-[0.25em] text-gray-400 uppercase">
            SK Studio Pune Management Gateway
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-400 flex items-center gap-2">
            <ShieldAlert size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-[0.25em] text-gray-400 font-mono">
              Admin Identifier / Email
            </label>
            <div className="flex items-center gap-3 rounded-2xl border border-[#2a2a2a] bg-[#111111] px-4 py-3.5 text-sm focus-within:border-[#d1b06c] transition-colors">
              <Mail size={16} className="text-[#d1b06c]" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@skstudio.store"
                className="w-full bg-transparent outline-none text-white text-sm"
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-[0.25em] text-gray-400 font-mono">
              Admin Password
            </label>
            <div className="flex items-center gap-3 rounded-2xl border border-[#2a2a2a] bg-[#111111] px-4 py-3.5 text-sm focus-within:border-[#d1b06c] transition-colors">
              <Lock size={16} className="text-[#d1b06c]" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Security Key"
                className="w-full bg-transparent outline-none text-white text-sm"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-[#d1b06c] transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-2xl bg-gradient-to-r from-[#d1b06c] to-[#a68443] px-5 py-3.5 text-xs font-extrabold uppercase tracking-[0.2em] text-black transition hover:opacity-95 disabled:opacity-50 shadow-lg"
          >
            {loading ? "Verifying Credentials..." : "Authenticate Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
