"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@/components/Providers";
import { Sun, Moon, Search, Menu, X, ChevronDown, ChevronRight, Bell, MessageSquare, LogOut, UserCheck } from "lucide-react";
import ClientChatModal from "@/components/ClientChatModal";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [megaOpen, setMegaOpen] = useState(false);
  const megaMenuRef = useRef<HTMLLIElement>(null);
  const isDark = theme === "dark";

  // Dynamic Auth & Messaging state
  const [userSession, setUserSession] = useState<any | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  // Check auth and unread messages count
  const checkAuthAndUnread = async () => {
    try {
      const meRes = await fetch("/api/auth/me");
      if (meRes.ok) {
        const meData = await meRes.json();
        if (meData.success && meData.user) {
          setUserSession(meData.user);
          // Fetch unread count for logged-in user
          const msgRes = await fetch("/api/messages?markRead=false");
          if (msgRes.ok) {
            const msgData = await msgRes.json();
            if (msgData.success) {
              setUnreadCount(msgData.unreadCount || 0);
            }
          }
        } else {
          setUserSession(null);
          setUnreadCount(0);
        }
      } else {
        setUserSession(null);
        setUnreadCount(0);
      }
    } catch (err) {
      setUserSession(null);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    checkAuthAndUnread();
    // Poll every 30 seconds instead of 3s to keep server response fast
    const interval = setInterval(checkAuthAndUnread, 30000);
    window.addEventListener("focus", checkAuthAndUnread);

    // Instant real-time SSE listener for admin message dispatches
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource("/api/public/events");
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "data_changed" || data.type === "message_received") {
            checkAuthAndUnread();
          }
        } catch (e) {}
      };
    } catch (e) {}

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", checkAuthAndUnread);
      if (eventSource) eventSource.close();
    };
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    }
    document.cookie = "sk_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "sk_session_jwt=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setUserSession(null);
    setUnreadCount(0);
    window.location.href = "/";
  };

  // Auto hide top bar on scroll down, reveal on scroll up
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 20) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Escape key and Click Outside handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMegaOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target as Node)) {
        setMegaOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      window.setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) {
      setSearchQuery("");
    }
  }, [searchOpen]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Portfolio", href: "/portfolio" },
    { name: "Process", href: "/process" },
    { name: "Testimonials", href: "/testimonials" },
    { name: "Contact", href: "/contact" },
  ];

  const getNavHref = (href: string) => {
    if (href === "/") return "/";
    if (href.startsWith("#") && pathname !== "/") {
      return `/${href}`;
    }
    return href;
  };

  const quickActions = [{ label: "Login", href: "/login" }];

  const serviceLinks = [
    { 
      name: "Wedding Segment", 
      description: "Cinematic wedding stories", 
      href: "/services/wedding-segment",
      subcategories: [
        { name: "Pre-wedding", href: "/services/pre-wedding" },
        { name: "Haldi", href: "/services/haldi" },
        { name: "Wedding", href: "/services/wedding" }
      ]
    },
    { 
      name: "Maternity Portraits", 
      description: "Elegant pregnancy photo sessions", 
      href: "/services/maternity",
      subcategories: [
        { name: "Indoor", href: "/services/maternity-indoor" },
        { name: "Outdoor", href: "/services/maternity-outdoor" }
      ]
    },
    { 
      name: "Baby Shoot", 
      description: "Delightful concept setups", 
      href: "/services/baby",
      subcategories: [
        { name: "Indoor", href: "/services/baby-indoor" },
        { name: "Outdoor", href: "/services/baby-outdoor" },
        { name: "Newborn", href: "/services/newborn" }
      ]
    },
    { 
      name: "Theme Shoots", 
      description: "Bespoke creative theme concepts", 
      href: "/services/theme" 
    },
    { 
      name: "Eyara Album", 
      description: "Exclusive concept portfolio session", 
      href: "/services/eyara" 
    },
    { 
      name: "Photo Frames", 
      description: "Custom handcrafted wooden frames", 
      href: "/photo-frames" 
    },
  ];

  const searchableItems = [
    { title: "Home", description: "Welcome and hero section", href: "#home", type: "Section" },
    { title: "About Us", description: "Our studio story", href: "#about", type: "Section" },
    { title: "Services", description: "Browse signature photography services", href: "#services", type: "Section" },
    { title: "Portfolio", description: "View recent work", href: "#portfolio", type: "Section" },
    { title: "Wedding Segment", description: "Cinematic wedding photography", href: "/services/wedding-segment", type: "Service" },
    { title: "Pre-Wedding Shoot", description: "Romantic couple photoshoots", href: "/services/pre-wedding", type: "Service" },
    { title: "Haldi Shoot", description: "Traditional haldi highlights", href: "/services/haldi", type: "Service" },
    { title: "Wedding Shoot", description: "Cinematic marriage coverage", href: "/services/wedding", type: "Service" },
    { title: "Maternity Portraits", description: "Luxury maternity shoots", href: "/services/maternity", type: "Service" },
    { title: "Baby & Newborn", description: "Soft baby and toddler stories", href: "/services/newborn", type: "Service" },
    { title: "Theme Shoots", description: "Creative themed studio concepts", href: "/services/theme", type: "Service" },
    { title: "Eyara Album", description: "Exclusive concept session", href: "/services/eyara", type: "Portfolio" },
    { title: "Contact", description: "Book your session", href: "#contact", type: "Section" },
  ];

  const filteredResults = searchQuery.trim()
    ? searchableItems.filter((item) => {
        const haystack = `${item.title} ${item.description} ${item.type}`.toLowerCase();
        return haystack.includes(searchQuery.toLowerCase());
      })
    : searchableItems.slice(0, 6);

  const handleSearchSelect = (item: { href: string }) => {
    setSearchOpen(false);
    setSearchQuery("");

    if (item.href.startsWith("#")) {
      const target = document.getElementById(item.href.slice(1));
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    router.push(item.href);
  };

  const handleCloseMenus = () => {
    setMobileMenuOpen(false);
    setServicesOpen(false);
  };

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out glass border-b border-[var(--glass-border)] py-1.5 md:py-2 px-4 md:px-10 flex items-center justify-between ${
          isVisible || mobileMenuOpen || searchOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <Link
          href="/"
          prefetch={true}
          onClick={(e) => {
            if (pathname === "/") {
              e.preventDefault();
              window.location.hash = "";
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          className="flex items-center select-none ml-2 md:ml-6"
        >
          <img
            src="/img/logo-light.png"
            alt="SK Studio Pune Logo"
            className="h-10 md:h-11 w-auto object-contain logo-blend transition-transform duration-500 hover:scale-105"
          />
        </Link>

        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const targetHref = getNavHref(link.href);
            const isAnchor = link.href.startsWith("#");
            return (
              <li key={link.name}>
                <Link
                  href={targetHref}
                  prefetch={true}
                  onClick={(e) => {
                    if (isAnchor && pathname === "/") {
                      e.preventDefault();
                      const id = link.href.slice(1);
                      if (id === "home") {
                        window.scrollTo({ top: 0, behavior: "instant" });
                      } else {
                        const el = document.getElementById(id);
                        if (el) {
                          el.scrollIntoView({ behavior: "instant", block: "start" });
                        }
                      }
                    }
                  }}
                  className="text-sm font-medium tracking-[0.1em] text-[var(--foreground)] hover:text-[var(--accent)] transition-colors relative py-2 group"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[var(--accent)] transition-all duration-300 group-hover:w-full" />
                </Link>
              </li>
            );
          })}
          <li 
            ref={megaMenuRef}
            onMouseEnter={() => setMegaOpen(true)}
            onMouseLeave={() => setMegaOpen(false)}
            onFocus={() => setMegaOpen(true)}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setMegaOpen(false);
              }
            }}
            className="relative group"
          >
            <button
              type="button"
              className="flex items-center gap-1 text-sm font-medium tracking-[0.1em] text-[var(--foreground)] hover:text-[var(--accent)] transition-colors py-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:outline-none rounded clickable"
            >
              Services
              <ChevronDown size={16} className={`transition-transform duration-300 ${megaOpen ? "rotate-180" : ""}`} />
            </button>
            <div 
              className={`absolute left-0 top-full pt-4 w-[380px] flex flex-col transition-all transform z-50 ${
                megaOpen 
                  ? "opacity-100 translate-y-0 pointer-events-auto duration-200 ease-out" 
                  : "opacity-0 -translate-y-2 pointer-events-none duration-150 ease-in"
              }`}
            >
              <div className={`rounded-3xl border bg-[var(--card-bg)]/95 p-3 shadow-2xl backdrop-blur-2xl flex flex-col gap-1 transition-all duration-300 ${
                isDark 
                  ? "border-white/10 shadow-black/85" 
                  : "border-black/5 shadow-gray-300/40"
              }`}>
                {serviceLinks.map((service, idx) => (
                  <div
                    key={service.name}
                    style={{
                      transitionDelay: megaOpen ? `${idx * 30}ms` : "0ms",
                      transform: megaOpen ? "translateY(0)" : "translateY(8px)",
                      opacity: megaOpen ? 1 : 0
                    }}
                    className={`rounded-2xl px-4 py-3 transition-all duration-300 flex flex-col gap-1 ${
                      isDark ? "hover:bg-white/5" : "hover:bg-black/[0.04]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Link
                        href={service.href}
                        onClick={() => {
                          setMegaOpen(false);
                          handleCloseMenus();
                        }}
                        className="text-[15px] font-bold text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
                      >
                        {service.name}
                      </Link>
                      {!service.subcategories && <ChevronRight size={16} className="text-[var(--accent)] opacity-60" />}
                    </div>
                    <p className="text-[11px] text-[var(--foreground)]/60 font-medium">{service.description}</p>
                    {service.subcategories && (
                      <div className="flex flex-wrap gap-3 mt-1.5" onClick={(e) => e.stopPropagation()}>
                        {service.subcategories.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            onClick={() => {
                              setMegaOpen(false);
                              handleCloseMenus();
                            }}
                            className="text-[11px] font-semibold text-[var(--foreground)]/70 hover:text-[var(--accent)] transition-all relative after:content-[''] after:absolute after:-bottom-0.5 after:left-0 after:w-0 after:h-[1px] after:bg-[var(--accent)] hover:after:w-full after:transition-all"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </li>
        </ul>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden lg:flex items-center gap-2">
            {userSession ? (
              <>
                {/* Authenticated Notification Bell Button (Only visible when logged in) */}
                <button
                  onClick={() => {
                    setIsChatOpen(true);
                    setUnreadCount(0);
                  }}
                  className="relative p-2.5 rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black transition-all clickable"
                  title="Studio Messages & Notifications"
                >
                  <Bell size={16} className={unreadCount > 0 ? "animate-bounce text-rose-500" : ""} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 bg-rose-600 text-white font-bold font-mono text-[10px] rounded-full flex items-center justify-center border-2 border-[var(--background)] shadow-md animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* User Account Button with Hover Dropdown (Reveals Logout on Cursor Hover) */}
                <div className="relative group select-none">
                  <button className="flex items-center gap-2 rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black transition-all">
                    <UserCheck size={14} />
                    <span className="max-w-[100px] truncate">{userSession.name || "Account"}</span>
                    <ChevronDown size={12} className="transition-transform group-hover:rotate-180" />
                  </button>

                  {/* Hover Dropdown Menu (Logout button visible ONLY when cursor is hovered) */}
                  <div className="absolute right-0 top-full pt-2 w-52 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-2 shadow-2xl flex flex-col gap-1 backdrop-blur-xl">
                      <div className="px-3 py-2 border-b border-[var(--card-border)] flex flex-col">
                        <span className="text-xs font-bold truncate text-[var(--foreground)]">{userSession.name}</span>
                        <span className="text-[10px] font-mono text-gray-400 truncate">{userSession.email}</span>
                      </div>

                      <Link
                        href="/bookings"
                        className="px-3 py-2 rounded-xl text-xs font-medium text-[var(--foreground)] hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] transition-colors flex items-center justify-between"
                      >
                        <span>My Bookings</span>
                        <ChevronRight size={13} />
                      </Link>

                      <button
                        onClick={() => {
                          setIsChatOpen(true);
                          setUnreadCount(0);
                        }}
                        className="px-3 py-2 rounded-xl text-xs font-medium text-[var(--foreground)] hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] transition-colors flex items-center justify-between text-left"
                      >
                        <span>Studio Messages</span>
                        {unreadCount > 0 && (
                          <span className="bg-rose-600 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors flex items-center justify-between mt-1 border-t border-[var(--card-border)]"
                      >
                        <span>Logout Session</span>
                        <LogOut size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                Login
              </Link>
            )}
          </div>

          <div className="search-vnuny-container btn-search">
            <input
              type="checkbox"
              className="checkbox"
              defaultChecked
              aria-label="Toggle Search Input"
            />
            <div className="mainbox">
              <div className="iconContainer">
                <svg viewBox="0 0 512 512" height="1em" xmlns="http://www.w3.org/2000/svg" className="search_icon">
                  <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"></path>
                </svg>
              </div>
              <input
                className="search_input"
                placeholder="search"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim().length > 0) {
                    setSearchOpen(true);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim().length > 0) {
                    setSearchOpen(true);
                  }
                }}
              />
            </div>
          </div>

          {/* Iconic Mobile Menu Button (Three Dots) */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open Menu"
            className="w-10 h-10 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center gap-1 text-[var(--foreground)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all md:hidden shadow-sm"
          >
            <span className="w-1 h-1 rounded-full bg-current transition-colors" />
            <span className="w-1 h-1 rounded-full bg-current transition-colors" />
            <span className="w-1 h-1 rounded-full bg-current transition-colors" />
          </button>

          {/* Theme Switch Removed */}
        </div>
      </nav>

      {/* Drawer Backdrop Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Sliding Drawer Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-[300px] sm:w-[340px] bg-[var(--card-bg)] text-[var(--foreground)] border-l border-[var(--card-border)] z-[65] shadow-2xl transition-transform duration-300 md:hidden overflow-y-auto px-5 py-6 flex flex-col backdrop-blur-2xl ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Mobile menu header with exact Home Page Logo */}
        <div className="w-full flex items-center justify-between mb-6 pb-4 border-b border-[var(--card-border)]">
          <Link href="/" onClick={handleCloseMenus} className="flex items-center">
            <img
              src="/img/logo-light.png"
              alt="SK Studio Pune Logo"
              className="h-11 w-auto object-contain logo-blend"
            />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close Menu"
            className="p-2 text-[var(--foreground)] hover:text-[var(--accent)] transition-colors rounded-full bg-[var(--background)] border border-[var(--card-border)]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick section links grid (Fits Testimonials & All Titles Properly in Light & Dark mode) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
          {navLinks.map((link) => {
            const targetHref = getNavHref(link.href);
            const isAnchor = link.href.startsWith("#");
            return (
              <Link
                key={link.name}
                href={targetHref}
                prefetch={true}
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  if (isAnchor && pathname === "/") {
                    e.preventDefault();
                    const id = link.href.slice(1);
                    if (id === "home") {
                      window.scrollTo({ top: 0, behavior: "instant" });
                    } else {
                      const el = document.getElementById(id);
                      if (el) {
                        el.scrollIntoView({ behavior: "instant", block: "start" });
                      }
                    }
                  }
                }}
                className="py-2.5 px-2 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-[10px] font-extrabold uppercase tracking-wider text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)] active:scale-95 transition-all text-center truncate"
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Categories Section */}
        <div className="text-left flex-1 flex flex-col mt-4">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--foreground)]/40 font-mono mb-4 px-2">
            Services & Categories
          </h4>

          <div className="flex flex-col">
            {[
              {
                name: "Wedding Segment",
                href: "/services/wedding-segment",
                subs: [
                  { name: "Pre-Wedding", href: "/services/pre-wedding" },
                  { name: "Haldi", href: "/services/haldi" },
                  { name: "Wedding", href: "/services/wedding" }
                ]
              },
              {
                name: "Maternity Portraits",
                href: "/services/maternity",
                subs: [
                  { name: "Indoor", href: "/services/maternity-indoor" },
                  { name: "Outdoor", href: "/services/maternity-outdoor" }
                ]
              },
              {
                name: "Baby & Kids Shoot",
                href: "/services/baby",
                subs: [
                  { name: "Newborn", href: "/services/newborn" },
                  { name: "Baby Indoor", href: "/services/baby-indoor" },
                  { name: "Baby Outdoor", href: "/services/baby-outdoor" }
                ]
              },
              {
                name: "Theme Shoots",
                href: "/services/themes",
                subs: []
              },
              {
                name: "Eyara Album",
                href: "/services/eyara",
                subs: []
              },
              {
                name: "Custom Photo Frames",
                href: "/photo-frames",
                subs: []
              }
            ].map((cat) => (
              <div
                key={cat.name}
                className="py-3.5 px-2 border-b border-[var(--card-border)]/50 last:border-none flex flex-col gap-1.5"
              >
                <Link
                  href={cat.href}
                  onClick={() => handleCloseMenus()}
                  className="text-[15px] font-extrabold text-[var(--foreground)] hover:text-[var(--accent)] transition-colors flex justify-between items-center"
                >
                  {cat.name}
                  <ChevronRight size={14} className="opacity-40" />
                </Link>

                {cat.subs.length > 0 && (
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                    {cat.subs.map((sub) => (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        onClick={() => handleCloseMenus()}
                        className="text-[11px] font-medium text-[var(--foreground)]/60 hover:text-[var(--accent)] transition-colors"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Actions at bottom of mobile menu */}
          <div className="mt-8 mb-4 flex flex-col gap-2 justify-center w-full">
            {userSession ? (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsChatOpen(true);
                    setUnreadCount(0);
                  }}
                  className="w-full text-center rounded-full border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black py-3 text-xs font-extrabold uppercase tracking-[0.15em] transition-all bg-[var(--card-bg)] shadow-md flex items-center justify-center gap-2"
                >
                  <Bell size={15} /> Messages ({unreadCount} Unread)
                </button>
                <Link 
                  href="/bookings" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="w-full text-center rounded-full bg-[var(--accent)] text-black font-extrabold py-3 text-xs uppercase tracking-[0.15em] transition-all shadow-md"
                >
                  My Bookings
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-center rounded-full border border-red-500/30 text-red-500 hover:bg-red-500/10 py-2.5 text-xs font-bold uppercase tracking-[0.15em] transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link 
                href="/login" 
                onClick={() => setMobileMenuOpen(false)} 
                className="w-full text-center rounded-full border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black py-3 text-xs font-extrabold uppercase tracking-[0.2em] transition-all bg-[var(--card-bg)] shadow-md"
              >
                Login Account
              </Link>
            )}
          </div>
        </div>
      </div>

      {searchOpen && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-6 backdrop-blur-md">
          <button
            onClick={() => setSearchOpen(false)}
            aria-label="Close Search"
            className="absolute top-6 right-6 p-2 text-white hover:text-[var(--accent)] transition-colors"
          >
            <X size={24} />
          </button>

          <div className="w-full max-w-2xl flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={24} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services, sections, or portfolio..."
                className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] text-white text-xl py-4 pl-14 pr-6 rounded-full focus:outline-none focus:border-[var(--accent)] shadow-2xl"
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur">
              {filteredResults.length > 0 ? (
                filteredResults.map((item) => (
                  <button
                    key={`${item.title}-${item.href}`}
                    type="button"
                    onClick={() => handleSearchSelect(item)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition-colors hover:bg-white/10"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white">{item.title}</div>
                      <div className="text-xs text-white/60">{item.description}</div>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent)]">{item.type}</span>
                  </button>
                ))
              ) : (
                <p className="px-3 py-4 text-sm text-white/60 text-center">Item not found</p>
              )}
            </div>

            <p className="text-xs text-white/40 text-center font-mono uppercase tracking-widest mt-2 select-none">
              Press [ESC] to close
            </p>
          </div>
        </div>
      )}

      {/* Authenticated Client Chat Modal */}
      <ClientChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        userSession={userSession}
        onMessagesRead={() => setUnreadCount(0)}
      />
    </>
  );
}
