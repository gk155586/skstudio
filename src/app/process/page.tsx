"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { MessageSquare, Sparkles, Camera, Sliders, CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";

export default function DedicatedProcessPage() {
  const steps = [
    {
      step: "01",
      title: "Discovery & Theme Planning",
      desc: "We discuss your vision, preferred color schemes, backdrop concepts, and shoot duration over WhatsApp or in-person studio consultation.",
      icon: MessageSquare,
    },
    {
      step: "02",
      title: "Wardrobe & Prop Styling",
      desc: "Access our exclusive 35+ designer maternity gown closet, hand-crafted baby props, floral wraps, and royal wedding attire.",
      icon: Sparkles,
    },
    {
      step: "03",
      title: "Climate-Controlled Shoot",
      desc: "Relax in our private comfort suites. Our team manages optimal room temperature, newborn safety wrapping, and gentle baby posing.",
      icon: ShieldCheck,
    },
    {
      step: "04",
      title: "Cinema Lighting & 8K Capture",
      desc: "Using top-tier full-frame cameras, prime lenses, and soft cinema diffusion lights to capture stunning detail and real emotion.",
      icon: Camera,
    },
    {
      step: "05",
      title: "Master Color Grading & Delivery",
      desc: "Every picture is individually retouched, skin-toned, and color-graded before high-resolution digital or luxury framed delivery.",
      icon: Sliders,
    },
  ];

  return (
    <div className="relative min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--accent)] selection:text-black">
      <Navbar />

      <main className="pt-28 pb-20">
        <section className="py-12 px-6 max-w-7xl mx-auto">
          <Reveal style="blur" className="text-center mb-16">
            <span className="inline-block text-xs font-mono tracking-widest text-[var(--accent)] uppercase font-semibold mb-4 px-4 py-1.5 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10">
              Seamless Client Experience
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display leading-tight tracking-tight mb-6">
              Our 5-Step <span className="text-[var(--accent)]">Process</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
              From your initial consultation to final luxury frame delivery, discover how we ensure a comfortable, memorable, and stress-free photoshoot experience.
            </p>
          </Reveal>

          {/* Timeline Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {steps.map((st, i) => {
              const Icon = st.icon;
              return (
                <Reveal key={st.step} style="blur" delayMs={i * 90}>
                  <div className="h-full p-8 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xl flex flex-col relative group hover:border-[var(--accent)]/60 transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-4xl font-extrabold font-mono text-[var(--accent)] opacity-80">
                        {st.step}
                      </span>
                      <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--accent)] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                    <h3 className="text-xl font-extrabold font-display mb-3 text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                      {st.title}
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed font-sans">
                      {st.desc}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>

          {/* CALL TO ACTION */}
          <Reveal style="blur" className="mt-20">
            <div className="p-10 sm:p-14 rounded-3xl border border-[var(--accent)]/40 shadow-2xl text-white relative overflow-hidden min-h-[300px] flex flex-col items-center justify-center text-center">
              <Image src="/images/sk_studio_pune_1726027106_3454488205886241451_63216979904_-_Copy.jpg" alt="Call to Action Background" fill unoptimized className="object-cover object-top z-0" />
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
