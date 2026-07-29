"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Mail, Eye, EyeOff, User, Phone } from "lucide-react";

type Page = "login" | "register";

export default function UserLoginPage() {
  const router = useRouter();
  const [page, setPage] = useState<Page>("login");

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regMobile, setRegMobile] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regShowPassword, setRegShowPassword] = useState(false);
  const [regError, setRegError] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  // If user is already logged in, redirect to bookings
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          window.location.href = "/bookings";
        }
      })
      .catch(() => {});
  }, []);

  // User Login handler
  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      if (!email.trim()) {
        setLoginError("Email address is required");
        setLoginLoading(false);
        return;
      }
      if (!password) {
        setLoginError("Password is required");
        setLoginLoading(false);
        return;
      }

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (data.success) {
        window.location.href = "/bookings";
      } else {
        setLoginError(data.message || "Invalid email or password");
      }
    } catch (err) {
      setLoginError("An error occurred. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  // User Register handler
  const handleUserRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    setRegLoading(true);

    try {
      if (!regName.trim()) {
        setRegError("Full name is required");
        setRegLoading(false);
        return;
      }
      if (!regEmail.trim()) {
        setRegError("Email address is required");
        setRegLoading(false);
        return;
      }
      if (!regMobile.trim()) {
        setRegError("Mobile number is required");
        setRegLoading(false);
        return;
      }
      if (!regPassword || regPassword.length < 6) {
        setRegError("Password must be at least 6 characters");
        setRegLoading(false);
        return;
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: regName.trim(),
          email: regEmail.trim(),
          mobile: regMobile.trim(),
          password: regPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        window.location.href = "/bookings";
      } else {
        setRegError(data.message || "Registration failed");
      }
    } catch (err) {
      setRegError("An error occurred. Please try again.");
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] p-8 shadow-2xl">
        <Link href="/" className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-[var(--accent)] transition-colors mb-6 font-mono uppercase tracking-wider">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="flex flex-col gap-4 text-center mb-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)]">
            <User size={24} />
          </div>
          <h1 className="text-3xl font-bold font-display">
            {page === "login" ? "Client Login" : "Create Client Account"}
          </h1>
          <p className="text-xs text-gray-500 max-w-xl mx-auto">
            {page === "login"
              ? "Sign in to access your photoshoot bookings, track session updates & view gallery albums."
              : "Register an account to book photoshoot sessions with SK Photo Studio Pune."}
          </p>
        </div>

        {page === "login" ? (
          <form onSubmit={handleUserLogin} className="flex flex-col gap-5">
            {loginError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-500">
                {loginError}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-mono">
                Email Address
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-3.5">
                <Mail size={16} className="text-[var(--accent)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@example.com"
                  className="w-full bg-transparent outline-none text-sm"
                  disabled={loginLoading}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-mono">
                Password
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-3.5">
                <Lock size={16} className="text-[var(--accent)]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-transparent outline-none text-sm"
                  disabled={loginLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-500 hover:text-[var(--accent)] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="rounded-full bg-[var(--accent)] px-5 py-3.5 text-xs font-extrabold uppercase tracking-[0.2em] text-black transition hover:opacity-90 disabled:opacity-50"
            >
              {loginLoading ? "Signing in..." : "Client Login"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleUserRegister} className="flex flex-col gap-5">
            {regError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-500">
                {regError}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-mono">
                Full Name
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-3.5">
                <User size={16} className="text-[var(--accent)]" />
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-transparent outline-none text-sm"
                  disabled={regLoading}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-mono">
                Email Address
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-3.5">
                <Mail size={16} className="text-[var(--accent)]" />
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-transparent outline-none text-sm"
                  disabled={regLoading}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-mono">
                Mobile Number
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-3.5">
                <Phone size={16} className="text-[var(--accent)]" />
                <input
                  type="tel"
                  value={regMobile}
                  onChange={(e) => setRegMobile(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-transparent outline-none text-sm"
                  disabled={regLoading}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-mono">
                Password
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-3.5">
                <Lock size={16} className="text-[var(--accent)]" />
                <input
                  type={regShowPassword ? "text" : "password"}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-transparent outline-none text-sm"
                  disabled={regLoading}
                />
                <button
                  type="button"
                  onClick={() => setRegShowPassword(!regShowPassword)}
                  className="text-gray-500 hover:text-[var(--accent)] transition-colors"
                >
                  {regShowPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={regLoading}
              className="rounded-full bg-[var(--accent)] px-5 py-3.5 text-xs font-extrabold uppercase tracking-[0.2em] text-black transition hover:opacity-90 disabled:opacity-50"
            >
              {regLoading ? "Registering..." : "Create Account"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-xs text-gray-500">
          {page === "login" ? (
            <>
              New client?{" "}
              <button
                onClick={() => {
                  setPage("register");
                  setLoginError("");
                }}
                className="text-[var(--accent)] hover:underline font-bold"
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => {
                  setPage("login");
                  setRegError("");
                }}
                className="text-[var(--accent)] hover:underline font-bold"
              >
                Login here
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
