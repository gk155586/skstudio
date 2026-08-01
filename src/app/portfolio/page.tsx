"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { Sparkles, ArrowRight, ChevronRight, Layers } from "lucide-react";

export default function DedicatedPortfolioPage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filterTabs = [
    { id: "all", name: "All Vault Categories" },
    { id: "wedding", name: "Wedding Segment" },
    { id: "maternity", name: "Maternity Portraits" },
    { id: "baby", name: "Baby Shoot" },
    { id: "theme", name: "Theme Shoots" },
    { id: "frames", name: "Photo Frames" },
  ];

  const categories = [
    {
      id: "wedding",
      title: "Wedding Segment",
      description: "Cinematic wedding stories",
      mainImage: "/images/portfolio_card1_fixed.jpg",
      href: "/services/wedding-segment",
      tag: "High Demand",
      subcategories: [
        { name: "Pre-wedding", href: "/services/pre-wedding" },
        { name: "Haldi", href: "/services/haldi" },
        { name: "Wedding", href: "/services/wedding" },
      ],
    },
    {
      id: "maternity",
      title: "Maternity Portraits",
      description: "Elegant pregnancy photo sessions",
      mainImage: "/images/portfolio_card2_fixed_v2.jpg",
      href: "/services/maternity",
      tag: "Studio & Outdoor",
      subcategories: [
        { name: "Indoor", href: "/services/maternity-indoor" },
        { name: "Outdoor", href: "/services/maternity-outdoor" },
      ],
    },
    {
      id: "baby",
      title: "Baby Shoot",
      description: "Delightful concept setups",
      mainImage: "/images/portfolio_card3_fixed.jpg",
      href: "/services/baby",
      tag: "Certified Safety",
      subcategories: [
        { name: "Indoor", href: "/services/baby-indoor" },
        { name: "Outdoor", href: "/services/baby-outdoor" },
        { name: "Newborn", href: "/services/newborn" },
      ],
    },
    {
      id: "theme",
      title: "Theme Shoots",
      description: "Bespoke creative theme concepts",
      mainImage: "/img/gallery/Themes/SK_08338.JPG",
      href: "/services/themes",
      tag: "Exclusive",
      subcategories: [
        { name: "Eyara Album — Exclusive concept portfolio session", href: "/services/eyara" },
      ],
    },
    {
      id: "frames",
      title: "Photo Frames",
      description: "Custom handcrafted wooden frames",
      mainImage: "/images/SK_00582 copy.jpg.jpeg",
      href: "/photo-frames",
      tag: "Handcrafted Luxury",
      subcategories: [],
    },
  ];

  const displayedCategories = activeCategory === "all"
    ? categories
    : categories.filter(c => c.id === activeCategory);

  return (
    <div className="relative min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--accent)] selection:text-black">
      <Navbar />

      <main className="pt-28 pb-20">
        <section className="py-12 px-6 max-w-7xl mx-auto">
          <Reveal style="blur" className="text-center mb-12">
            <span className="inline-block text-xs font-mono tracking-widest text-[var(--accent)] uppercase font-semibold mb-4 px-4 py-1.5 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10">
              SK Studio Shoot Vault & Portfolio
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display leading-tight tracking-tight mb-6">
              Our Masterpiece <span className="text-[var(--accent)]">Categories</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Explore our complete creative portfolio across weddings, maternity sessions, newborn themes, bespoke albums, and luxury handcrafted photo frames.
            </p>
          </Reveal>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-14">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                  activeCategory === tab.id
                    ? "bg-[var(--accent)] text-black shadow-lg scale-105"
                    : "bg-[var(--card-bg)] text-[var(--foreground)] border border-[var(--card-border)] hover:border-[var(--accent)]/60"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* Service Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedCategories.map((cat, i) => (
              <Reveal key={cat.title} style="blur" delayMs={i * 90}>
                <div className="h-full rounded-3xl overflow-hidden border border-[var(--card-border)] bg-[var(--card-bg)] shadow-2xl flex flex-col group hover:border-[var(--accent)]/60 transition-all duration-500">
                  {/* Image Header */}
                  <Link href={cat.href} className="relative block w-full aspect-[4/3] bg-black overflow-hidden">
                    <Image
                      src={cat.mainImage}
                      alt={cat.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <span className="absolute top-4 right-4 text-[10px] font-mono uppercase tracking-widest bg-[var(--accent)] text-black font-extrabold px-3 py-1 rounded-full shadow-md">
                      {cat.tag}
                    </span>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h2 className="text-2xl font-extrabold text-white font-display leading-tight group-hover:text-[var(--accent)] transition-colors">
                        {cat.title}
                      </h2>
                    </div>
                  </Link>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-400 font-sans mb-4 leading-relaxed">
                        {cat.description}
                      </p>

                      {/* Subcategories Pills */}
                      {cat.subcategories.length > 0 && (
                        <div className="pt-3 border-t border-[var(--card-border)] flex flex-wrap gap-2">
                          {cat.subcategories.map((sub) => (
                            <Link
                              key={sub.name}
                              href={sub.href}
                              className="px-3 py-1.5 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-[11px] font-semibold text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:scale-[1.02] transition-all flex items-center gap-1"
                            >
                              <span>{sub.name}</span>
                              <ChevronRight size={12} className="text-[var(--accent)]" />
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>

                    <Link
                      href={cat.href}
                      className="mt-6 inline-flex items-center justify-between w-full px-5 py-3 rounded-2xl bg-[var(--background)] border border-[var(--card-border)] text-xs font-extrabold uppercase tracking-wider text-[var(--foreground)] group-hover:border-[var(--accent)]/50 group-hover:text-[var(--accent)] transition-all"
                    >
                      <span>Explore Category</span>
                      <ArrowRight size={16} className="text-[var(--accent)] group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* CTA STRIP */}
          <div className="mt-20 p-10 rounded-3xl bg-gradient-to-r from-[var(--card-bg)] via-[var(--background)] to-[var(--card-bg)] border border-[var(--card-border)] flex flex-col md:flex-row items-center justify-between gap-6 text-left">
            <div>
              <h3 className="text-2xl font-extrabold font-display">Looking for Something Bespoke?</h3>
              <p className="text-sm text-gray-400 mt-1">Book your consultation with SK Photo Studio Pune for custom set design and theme shoot packages.</p>
            </div>
            <Link
              href="/contact"
              className="px-8 py-4 rounded-full bg-[var(--accent)] text-black font-extrabold text-sm uppercase tracking-wider hover:opacity-95 transition-all shadow-lg whitespace-nowrap"
            >
              Book Studio Consultation &rarr;
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
