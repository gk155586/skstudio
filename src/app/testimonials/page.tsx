"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { Star, Quote, Heart, CheckCircle, MessageSquare, ArrowRight } from "lucide-react";

export default function DedicatedTestimonialsPage() {
  const reviews = [
    {
      name: "Pooja & Rahul Sharma",
      category: "Maternity & Newborn Shoot",
      rating: 5,
      date: "Pune • Recent Client",
      comment: "SK Photo Studio made our maternity shoot absolute magic! The gown collection is top class, and they handled our 15-day-old newborn with so much patience and care. The final canvas frames are hanging in our living room!",
      avatar: "/img/gallery/maternity-indoor/maternity-indoor-cover.jpg",
    },
    {
      name: "Aditya & Neha Kulkarni",
      category: "Destination Wedding",
      rating: 5,
      date: "Pune • Married 2024",
      comment: "The wedding teasers and 4K traditional films created by SK Studio blew our whole family away! They captured every emotional moment without being intrusive. Truly Pune's finest photography team.",
      avatar: "/img/gallery/wedding/wedding-cover.jpg",
    },
    {
      name: "Sneha & Vikram Joshi",
      category: "1st Birthday Baby Outdoor",
      rating: 5,
      date: "Kothrud, Pune",
      comment: "Capturing a 1-year-old toddler is tough, but SK Studio's team knew exactly how to make him laugh! Beautiful lighting, vibrant color grading, and prompt delivery.",
      avatar: "/img/gallery/baby-outdoor/8/SK_00011.JPG",
    },
    {
      name: "Ananya & Rohan Deshmukh",
      category: "Pre-Wedding Shoot",
      rating: 5,
      date: "Lonavala • Pre-Wedding",
      comment: "From dawn light in Lonavala to romantic sunset shots, the team was full of energy and creative ideas. We got over 150 retouched photos in HD quality!",
      avatar: "/img/gallery/pre-wedding/pre-wedding-cover.jpg",
    },
    {
      name: "Priya & Amit Patil",
      category: "Baby Indoor Theme",
      rating: 5,
      date: "Wakad, Pune",
      comment: "The indoor piano set and cute theme props for our baby's shoot were amazing. Temperature-controlled studio made sure baby was super comfortable throughout.",
      avatar: "/images/about-newborn-stylist-upright.jpg",
    },
    {
      name: "Dr. Meera Iyer",
      category: "Luxury Photo Frame Order",
      rating: 5,
      date: "Baner, Pune",
      comment: "Ordered 3 handcrafted wooden canvas frames for our family portraits. Premium acrylic glass texture and vibrant colors. 100% recommended!",
      avatar: "/images/SK_00521.jpg.jpeg",
    },
  ];

  return (
    <div className="relative min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--accent)] selection:text-black">
      <Navbar />

      <main className="pt-28 pb-20">
        <section className="py-12 px-6 max-w-7xl mx-auto">
          <Reveal style="blur" className="text-center mb-16">
            <span className="inline-block text-xs font-mono tracking-widest text-[var(--accent)] uppercase font-semibold mb-4 px-4 py-1.5 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10">
              Real Client Stories
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display leading-tight tracking-tight mb-6">
              Loved by <span className="text-[var(--accent)]">1,200+ Families</span>
            </h1>
            <p className="text-base sm:text-lg text-[var(--foreground)]/70 max-w-2xl mx-auto leading-relaxed">
              Read authentic feedback from couples, parents, and families who trusted SK Photo Studio Pune for their most cherished life milestones.
            </p>
          </Reveal>

          {/* GOOGLE RATING STRIP */}
          <Reveal style="diagonal" className="mb-16">
            <div className="p-8 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xl flex flex-col sm:flex-row items-center justify-around gap-6 text-center">
              <div>
                <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={22} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-3xl font-extrabold font-display">5.0 / 5.0</span>
                <p className="text-xs text-[var(--foreground)]/70 mt-0.5">Average Google Client Rating</p>
              </div>

              <div className="h-12 w-[1px] bg-[var(--card-border)] hidden sm:block" />

              <div>
                <span className="text-3xl font-extrabold font-display text-[var(--accent)]">100%</span>
                <p className="text-xs text-[var(--foreground)]/70 mt-0.5">Satisfaction & Quality</p>
              </div>

              <div className="h-12 w-[1px] bg-[var(--card-border)] hidden sm:block" />

              <div>
                <span className="text-3xl font-extrabold font-display">5+ Years</span>
                <p className="text-xs text-[var(--foreground)]/70 mt-0.5">Trusted Studio Reputation in Pune</p>
              </div>
            </div>
          </Reveal>

          {/* REVIEWS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((rev, i) => (
              <Reveal key={rev.name} style="blur" delayMs={i * 80}>
                <div className="h-full p-8 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xl flex flex-col justify-between hover:border-[var(--accent)]/50 transition-all duration-300 relative group">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(rev.rating)].map((_, idx) => (
                          <Star key={idx} size={16} className="fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <Quote size={24} className="text-[var(--accent)] opacity-40 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <p className="text-sm text-[var(--foreground)]/80 leading-relaxed font-sans font-light mb-6">
                      "{rev.comment}"
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[var(--card-border)] flex items-center gap-3">
                    <div className="relative w-11 h-11 rounded-full overflow-hidden border border-[var(--accent)]/40 shrink-0 bg-black">
                      <Image
                        src={rev.avatar}
                        alt={rev.name}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-[var(--foreground)] font-display">{rev.name}</h4>
                      <p className="text-[11px] text-[var(--accent)] font-mono font-medium">{rev.category}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* CALL TO ACTION */}
          <Reveal style="blur" className="mt-20">
            <div className="p-10 sm:p-14 rounded-3xl border border-[var(--accent)]/40 shadow-2xl text-white relative overflow-hidden min-h-[300px] flex flex-col items-center justify-center text-center">
              <Image src="/images/sk_studio_pune_1726027106_3454488205886241451_63216979904_-_Copy.jpg" alt="Call to Action Background" fill sizes="100vw" className="object-cover object-top z-0" />
              <div className="absolute inset-0 bg-black/20 z-0 pointer-events-none" />
              <h2 className="text-3xl sm:text-4xl font-extrabold font-display mb-4 relative z-10">
                Ready to Capture Your Story?
              </h2>
              <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto mb-8 leading-relaxed relative z-10">
                Book a consultation or session with SK Photo Studio Pune today and turn your special moments into timeless portraits.
              </p>
              <Link
                href="/#contact"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[var(--accent)] text-black font-extrabold text-sm uppercase tracking-wider hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl relative z-10"
              >
                <span>Book a Session Now</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      <Footer />
    </div>
  );
}
