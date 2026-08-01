import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import Image from "next/image";
import Link from "next/link";
import { Camera, Heart, Award, Sparkles, ShieldCheck, Clock, Users, ArrowRight, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "About Us | SK Photo Studio Pune",
  description: "Learn about SK Photo Studio Pune - Pune's premier photography studio specializing in cinematic weddings, maternity, baby, and luxury portraiture.",
};

export default function AboutPage() {
  const stats = [
    { number: "1,200+", label: "Happy Clients", icon: Users },
    { number: "5+ Years", label: "Studio Excellence", icon: Award },
    { number: "100%", label: "Custom Sets & Props", icon: Sparkles },
    { number: "5.0 ★", label: "Client Rating", icon: Heart },
  ];

  const features = [
    {
      title: "Climate-Controlled Studio",
      description: "Our modern Pune studio is equipped with private comfort changing suites, temperature control, and sanitized newborn setup zones.",
      icon: ShieldCheck,
    },
    {
      title: "8K Cinema & High-Res Gear",
      description: "We utilize top-tier full-frame prime lenses, high-dynamic range camera bodies, and cinema-grade lighting for breathtaking clarity.",
      icon: Camera,
    },
    {
      title: "35+ Designer Gown Closet",
      description: "Complimentary access to our exclusive collection of luxury maternity gowns, baby costumes, and thematic props.",
      icon: Sparkles,
    },
    {
      title: "Master Color Grading",
      description: "Every final picture is individually retouched, color-graded, and artistically polished by expert retouching artists.",
      icon: Clock,
    },
  ];

  const team = [
    {
      name: "SK Studio Director",
      role: "Lead Photographer & Creative Director",
      image: "/images/SK_00521.jpg.jpeg",
      bio: "Over 5 years of passion capturing the emotional essence of Pune's finest weddings, maternity milestones, and baby portraits.",
    },
    {
      name: "Cinematography Team",
      role: "Senior Video & Drone Specialists",
      image: "/images/about_2nd_fixed.jpg",
      bio: "Crafting 4K cinematic teasers, traditional films, and pre-wedding music videos with aerial drone precision.",
    },
    {
      name: "Newborn & Prop Stylist",
      role: "Concept & Safety Specialist",
      image: "/images/row4_overlap_fixed.jpg",
      bio: "Specializing in gentle newborn wrapping, cute theme setups, and safe baby pose styling.",
    },
  ];

  return (
    <div className="relative min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--accent)] selection:text-black">
      <Navbar />

      <main className="pt-28 pb-20">
        {/* HERO SECTION */}
        <section className="relative py-16 lg:py-24 px-6 max-w-7xl mx-auto text-center">
          <Reveal style="blur">
            <span className="inline-block text-xs font-mono tracking-widest text-[var(--accent)] uppercase font-semibold mb-4 px-4 py-1.5 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10">
              Welcome to SK Photo Studio Pune
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display leading-tight tracking-tight mb-6 max-w-4xl mx-auto">
              Crafting Timeless Stories in Every <span className="text-[var(--accent)]">Frame.</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
              We are Pune’s premier photography studio specializing in cinematic weddings, tender newborn milestones, luxury maternity portraits, and bespoke concept shoots.
            </p>
          </Reveal>

          {/* HERO IMAGE BANNER */}
          <Reveal style="diagonal" delayMs={200}>
            <div className="relative w-full aspect-[21/9] min-h-[300px] rounded-3xl overflow-hidden shadow-2xl border border-[var(--card-border)] bg-black mb-16">
              <Image
                src="/images/hero-desktop.jpg"
                alt="SK Photo Studio Pune Facility"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 80vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 text-left">
                <p className="text-xs font-mono text-[var(--accent)] uppercase tracking-wider font-semibold">SK Studio Pune • Since 2016</p>
                <h3 className="text-xl sm:text-3xl font-extrabold text-white font-display">Where Memories Become Fine Art</h3>
              </div>
            </div>
          </Reveal>

          {/* STATS STRIP */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((st, i) => {
              const Icon = st.icon;
              return (
                <Reveal key={i} style="blur" delayMs={i * 80}>
                  <div className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-lg text-center flex flex-col items-center group hover:border-[var(--accent)]/50 transition-all duration-300">
                    <Icon className="w-8 h-8 text-[var(--accent)] mb-3 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-2xl sm:text-3xl font-extrabold font-display text-[var(--foreground)]">{st.number}</span>
                    <span className="text-xs font-medium text-gray-400 mt-1">{st.label}</span>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* OUR STORY SECTION */}
        <section className="py-16 px-6 max-w-7xl mx-auto border-t border-[var(--card-border)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <Reveal style="split">
              <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-[var(--card-border)] bg-black">
                <Image
                  src="/images/about-story-upright.jpg"
                  alt="SK Studio Passionate Photography"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>
            </Reveal>

            <Reveal style="diagonal" delayMs={150}>
              <div className="flex flex-col gap-6">
                <span className="text-xs font-mono tracking-widest text-[var(--accent)] uppercase font-semibold">Our Story & Mission</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold font-display leading-tight">
                  Passionate About Capturing Real Emotion & Lifelong Memories
                </h2>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                  Founded with a vision to revolutionize photo studio experiences in Pune, SK Photo Studio combines artistic lighting techniques, high-end cinema gear, and heartfelt storytelling.
                </p>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                  Whether it is the grand celebration of a traditional wedding, the gentle glow of maternity, or the heartwarming smile of a baby's first birthday, we treat every session with individual care and creativity.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {[
                    "100% Customized Concept Sets",
                    "Safety First Newborn Handling",
                    "Private Changing & Makeup Suites",
                    "High-Resolution Print & Frame Delivery",
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-[var(--accent)] shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* WHY CHOOSE US / FEATURES */}
        <section className="py-16 px-6 max-w-7xl mx-auto border-t border-[var(--card-border)]">
          <Reveal style="blur" className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono tracking-widest text-[var(--accent)] uppercase font-semibold">Studio Standard</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display mt-2">Why Families & Couples Choose SK Studio</h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <Reveal key={i} style="blur" delayMs={i * 100}>
                  <div className="p-7 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xl flex flex-col h-full hover:border-[var(--accent)]/60 transition-all duration-300 group">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/15 border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] mb-5 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold font-display mb-2 text-[var(--foreground)]">{feat.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{feat.description}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* TEAM SPOTLIGHT */}
        <section className="py-16 px-6 max-w-7xl mx-auto border-t border-[var(--card-border)]">
          <Reveal style="blur" className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono tracking-widest text-[var(--accent)] uppercase font-semibold">Our Experts</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display mt-2">Meet the Creative Team Behind SK Studio</h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((t, i) => (
              <Reveal key={i} style="diagonal" delayMs={i * 120}>
                <div className="rounded-3xl overflow-hidden bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xl group hover:border-[var(--accent)]/50 transition-all duration-300 flex flex-col h-full">
                  <div className="relative w-full aspect-[4/3] bg-black overflow-hidden">
                    <Image
                      src={t.image}
                      alt={t.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  </div>
                  <div className="p-6 flex flex-col flex-1 justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-[var(--accent)] uppercase tracking-wider font-semibold">{t.role}</span>
                      <h4 className="text-xl font-bold font-display text-[var(--foreground)] mt-1 mb-3">{t.name}</h4>
                      <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{t.bio}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="py-16 px-6 max-w-5xl mx-auto text-center">
          <Reveal style="blur">
            <div className="p-10 sm:p-14 rounded-3xl border border-[var(--accent)]/40 shadow-2xl text-white relative overflow-hidden min-h-[300px] flex flex-col items-center justify-center">
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
