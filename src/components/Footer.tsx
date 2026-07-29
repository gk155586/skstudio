"use client";

import React from "react";
import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { FaFacebookF, FaYoutube, FaInstagram } from "react-icons/fa";
import { useContent } from "@/components/Providers";

export default function Footer() {
  const { content } = useContent();
  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[var(--card-bg)] border-t border-[var(--card-border)] py-16 px-6 md:px-12 relative overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col gap-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo Column */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex items-center select-none w-fit">
              <img
                src="/img/logo-light.png"
                alt="SK Studio Pune Logo"
                className="h-14 w-auto object-contain logo-blend transition-transform duration-500 hover:scale-105"
              />
            </Link>
            
            <p className="text-xs text-gray-500 font-sans leading-relaxed">
              Bespoke concept photography and high-end video production based in Pune, India. Delivering premium wooden bound photo books and layflat albums.
            </p>

            {/* Social Buttons */}
            <div className="flex items-center gap-3">
              <a
                href="https://www.facebook.com/banwarideepankshi/"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="p-2.5 rounded-full bg-[var(--background)] border border-[var(--card-border)] text-gray-400 hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all duration-300"
              >
                <FaFacebookF size={16} />
              </a>
              <a
                href="https://www.youtube.com/@dbartworks-thepremiumweddi5090"
                target="_blank"
                rel="noreferrer"
                aria-label="Youtube"
                className="p-2.5 rounded-full bg-[var(--background)] border border-[var(--card-border)] text-gray-400 hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all duration-300"
              >
                <FaYoutube size={16} />
              </a>
              <a
                href="https://www.instagram.com/sk_kids_pune?igsh=MWpjbDljN2pudnIyOA=="
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="p-2.5 rounded-full bg-[var(--background)] border border-[var(--card-border)] text-gray-400 hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all duration-300"
              >
                <FaInstagram size={16} />
              </a>
            </div>
          </div>



          {/* Galleries Sitemap */}
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--foreground)] font-mono">
              Featured Portfolios
            </h4>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/services/wedding" className="text-xs text-gray-500 hover:text-[var(--accent)] transition-colors">
                  Wedding & Pre-Wedding
                </Link>
              </li>
              <li>
                <Link href="/services/maternity-indoor" className="text-xs text-gray-500 hover:text-[var(--accent)] transition-colors">
                  Maternity Portraits
                </Link>
              </li>
              <li>
                <Link href="/services/baby" className="text-xs text-gray-500 hover:text-[var(--accent)] transition-colors">
                  Baby & Kids Shoots
                </Link>
              </li>
              <li>
                <Link href="/services/theme" className="text-xs text-gray-500 hover:text-[var(--accent)] transition-colors">
                  Theme Shoots
                </Link>
              </li>
              <li>
                <Link href="/services/eyara" className="text-xs text-gray-500 hover:text-[var(--accent)] transition-colors">
                  Eyara Album
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Sitemap */}
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--foreground)] font-mono">
              Contact Us
            </h4>
            <ul className="flex flex-col gap-2 text-xs text-gray-500 dark:text-gray-450 leading-relaxed font-sans font-light">
              <li data-edit-id="contact.phone">WhatsApp: {content?.contact?.phone || "+91 93071 12119"}</li>
              <li>
                Mail:{" "}
                <a 
                  data-edit-id="contact.email"
                  href={`mailto:${content?.contact?.email || "skstudiopune@gmail.com"}`} 
                  className="hover:text-[var(--accent)] transition-colors lowercase"
                >
                  {content?.contact?.email || "skstudiopune@gmail.com"}
                </a>
              </li>
              <li>
                <a href="https://maps.app.goo.gl/BNVEcSovZRCPRdaj7" target="_blank" rel="noreferrer" className="text-[var(--accent)] hover:underline">
                  Open Map Location
                </a>
              </li>
            </ul>
          </div>

          {/* Connect Column */}
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--foreground)] font-mono">
              Connect With Us
            </h4>
            <div className="grid grid-cols-5 gap-3 max-w-[280px]">
              {/* WhatsApp */}
              <a
                href="https://wa.me/919307112119"
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.419 5.422.002 12.038.002c3.202.001 6.212 1.248 8.477 3.517 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.618-5.423 12.037-12.042 12.037-2.006-.001-3.978-.505-5.733-1.464L0 24zm6.082-3.26c1.602.951 3.5 1.452 5.897 1.453 5.4 0 9.792-4.393 9.795-9.797.002-2.618-1.013-5.08-2.859-6.929-1.848-1.849-4.31-2.86-6.924-2.86-5.404 0-9.8 4.394-9.802 9.8-.001 2.083.541 4.117 1.568 5.923l.1.178-1.096 4.004 4.1-.1.176-.113z"/>
                  </svg>
                </div>
                <span className="text-[7px] font-bold tracking-wider text-gray-500 group-hover:text-[var(--foreground)] transition-colors font-mono uppercase">WA</span>
              </a>

              {/* Message */}
              <a
                href="sms:+919307112119"
                className="flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <span className="text-[7px] font-bold tracking-wider text-gray-500 group-hover:text-[var(--foreground)] transition-colors font-mono uppercase">SMS</span>
              </a>

              {/* Email */}
              <a
                href="mailto:skstudiopune@gmail.com"
                className="flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-600/10 border border-rose-500/20 text-rose-400 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-[7px] font-bold tracking-wider text-gray-500 group-hover:text-[var(--foreground)] transition-colors font-mono uppercase">EMAIL</span>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/sk_kids_pune"
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-pink-600/10 border border-pink-500/20 text-pink-400 flex items-center justify-center group-hover:bg-gradient-to-tr group-hover:from-amber-500 group-hover:to-pink-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </div>
                <span className="text-[7px] font-bold tracking-wider text-gray-500 group-hover:text-[var(--foreground)] transition-colors font-mono uppercase">INSTA</span>
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/banwarideepankshi/"
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1V12h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/>
                  </svg>
                </div>
                <span className="text-[7px] font-bold tracking-wider text-gray-500 group-hover:text-[var(--foreground)] transition-colors font-mono uppercase">FB</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="flex flex-col md:flex-row items-center justify-between border-t border-[var(--card-border)] pt-8 mt-4 select-none gap-4">
          <p className="text-[10px] text-gray-500 font-mono tracking-widest">
            © 2026 SK STUDIO. ALL RIGHTS RESERVED.
          </p>
          
          <div className="flex items-center gap-4">
            <a
              href="#home"
              onClick={scrollToTop}
              className="flex items-center gap-2 text-xs text-gray-500 hover:text-[var(--accent)] transition-colors font-mono"
            >
              Back To Top <ArrowUp size={12} className="animate-bounce" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
