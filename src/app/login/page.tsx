"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Mail, Sparkles, Eye, EyeOff } from "lucide-react";

type Page = "login" | "register";

export default function LoginPage() {
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

  // Check if user is already logged in
  React.useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          const userEmail = (data.user.email || "").toLowerCase();
          if (data.user.role === "admin" || userEmail === "ganeshkalapadgk@gmail.com" || userEmail === "admin") {
            window.location.href = "/admin";
          } else {
            window.location.href = "/bookings";
          }
        }
      })
      .catch(() => {});
  }, []);

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      // Client-side validation
      if (!email.trim()) {
        setLoginError("Email is required");
        return;
      }
      if (!password) {
        setLoginError("Password is required");
        return;
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email) && email.trim().toLowerCase() !== "admin") {
        setLoginError("Invalid email format");
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
        const cleanUserEmail = email.trim().toLowerCase();
        const isAdmin = data.user?.role === "admin" || cleanUserEmail === "ganeshkalapadgk@gmail.com" || cleanUserEmail === "admin";
        
        if (isAdmin) {
          window.location.href = "/admin";
        } else {
          window.location.href = "/bookings";
        }
      } else {
        setLoginError(data.message || "Login failed");
      }
    } catch (err) {
      setLoginError("An error occurred. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoginLoading(false);
    }
  };

  // Register handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    setRegLoading(true);

    try {
      // Client-side validation
      if (!regName.trim()) {
        setRegError("Name is required");
        return;
      }
      if (!regEmail.trim()) {
        setRegError("Email is required");
        return;
      }
      if (!regMobile.trim()) {
        setRegError("Mobile number is required");
        return;
      }
      if (!regPassword) {
        setRegError("Password is required");
        return;
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(regEmail)) {
        setRegError("Invalid email format");
        return;
      }

      // Password length validation
      if (regPassword.length < 6) {
        setRegError("Password must be at least 6 characters");
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
      console.error("Register error:", err);
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] p-8 shadow-2xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[var(--accent)] transition-colors mb-6">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="flex flex-col gap-4 text-center mb-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)]">
            <Lock size={24} />
          </div>
          <h1 className="text-3xl font-bold font-display">
            {page === "login" ? "Login" : "Register"}
          </h1>
          <p className="text-sm text-gray-600 max-w-xl mx-auto">
            {page === "login"
              ? "Sign in to access your booking profile and manage your sessions."
              : "Create an account to start booking your photography session."}
          </p>
        </div>

        {page === "login" ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            {loginError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600">
                {loginError}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-[0.2em] text-gray-500 font-mono">
                Email Address
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-3">
                <Mail size={16} className="text-[var(--accent)]" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-transparent outline-none"
                  disabled={loginLoading}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-[0.2em] text-gray-500 font-mono">
                Password
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-3">
                <Lock size={16} className="text-[var(--accent)]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-transparent outline-none"
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
              className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginLoading ? "Logging in..." : "Login"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="flex flex-col gap-5">
            {regError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600">
                {regError}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-[0.2em] text-gray-500 font-mono">
                Full Name
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-3">
                <Mail size={16} className="text-[var(--accent)]" />
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-transparent outline-none"
                  disabled={regLoading}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-[0.2em] text-gray-500 font-mono">
                Email Address
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-3">
                <Mail size={16} className="text-[var(--accent)]" />
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-transparent outline-none"
                  disabled={regLoading}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-[0.2em] text-gray-500 font-mono">
                Mobile Number
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-3">
                <Mail size={16} className="text-[var(--accent)]" />
                <input
                  type="tel"
                  value={regMobile}
                  onChange={(e) => setRegMobile(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-transparent outline-none"
                  disabled={regLoading}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-[0.2em] text-gray-500 font-mono">
                Password
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-3">
                <Lock size={16} className="text-[var(--accent)]" />
                <input
                  type={regShowPassword ? "text" : "password"}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-transparent outline-none"
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
              className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {regLoading ? "Creating account..." : "Register"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-gray-600">
          {page === "login" ? (
            <>
              New here?{" "}
              <button
                onClick={() => {
                  setPage("register");
                  setLoginError("");
                }}
                className="text-[var(--accent)] hover:underline font-semibold"
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
                className="text-[var(--accent)] hover:underline font-semibold"
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
