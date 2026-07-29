"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import TextReveal from "@/components/TextReveal";

import { useContent } from "@/components/Providers";

interface StatItemProps {
  end: number;
  label: string;
  suffix?: string;
}

function StatCounter({ end, label, suffix = "" }: StatItemProps) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    let start = 0;
    const duration = 2000; // 2 seconds animation
    const increment = end / (duration / 16); // ~60fps
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [hasStarted, end]);

  return (
    <div ref={ref} className="text-center flex flex-col items-center p-6 border-b md:border-b-0 md:border-r border-[var(--card-border)] last:border-0 md:w-1/3">
      <h3 className="text-4xl md:text-7xl font-bold text-[var(--accent)] font-display tracking-tight mb-2">
        {count}
        {suffix}
      </h3>
      <p className="text-xs uppercase tracking-[0.2em] text-gray-500 font-mono">
        {label}
      </p>
    </div>
  );
}

export default function About() {
  const { content } = useContent();
  const aboutData = content?.about;

  return (
    <section id="about" className="py-24 px-6 md:px-12 bg-[var(--background)] border-t border-[var(--card-border)] relative overflow-hidden">
      {/* Soft background glow */}
      <div className="absolute top-1/4 right-0 w-80 h-80 rounded-full bg-[var(--accent)] opacity-5 blur-[120px] pointer-events-none" />

      {/* DESKTOP/LAPTOP VIEW (md: original side-by-side image left, narrative right) */}
      <div className="hidden md:flex max-w-6xl mx-auto flex-col lg:flex-row gap-16 items-center">
        {/* Visual Showcase with Diagonal Reveal */}
        <Reveal style="diagonal" className="w-full lg:w-1/2">
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl group border border-[var(--card-border)] w-full">
            <Image
              data-edit-id="about.image"
              src={aboutData?.image || "/img/exp.jpg"}
              alt="SK Studio Pune Studio Session"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
            
            {/* Tag Overlay */}
            <div className="absolute bottom-6 left-6 flex flex-col gap-1">
              <span data-edit-id="about.established" className="text-xs font-semibold tracking-widest text-[var(--accent)] font-mono uppercase">
                {aboutData?.established || "Established 2016"}
              </span>
              <h4 data-edit-id="about.awardLabel" className="text-xl font-bold text-white font-display">
                {aboutData?.awardLabel || "Pune's Highest Rated Firm"}
              </h4>
            </div>
          </div>
        </Reveal>

        {/* Narrative Section */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          <span data-edit-id="about.tag" className="text-xs font-semibold tracking-[0.3em] text-[var(--accent)] uppercase font-mono">
            {aboutData?.tag || "CONFIDENT STUDIO STORY"}
          </span>
          <div data-edit-id="about.title">
            <TextReveal
              text={aboutData?.title || "Crafting Unforgettable Visual Stories. Professional Excellence."}
              style="words"
              className="text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--foreground)] font-display leading-[1.15]"
            />
          </div>

          <div className="text-gray-600 dark:text-gray-300 flex flex-col gap-4 font-light leading-relaxed">
            <p data-edit-id="about.p1">
              {aboutData?.p1 || "SK Studio Pune is a distinguished visual arts firm known for capturing unforgettable moments with cinematic precision, utilizing best-in-class props, sets, and styling."}
            </p>
            <p data-edit-id="about.p2">
              {aboutData?.p2 || "With over 1,400+ positive reviews, we stand proud as one of Pune's most-rated photography firms. Our client portfolio includes corporate builders, national sports figures, and destination projects."}
            </p>
            <p data-edit-id="about.p3" className="font-sans font-medium text-[var(--accent)] italic">
              {aboutData?.p3 || "Dedicated to Precision, Artistry & Timeless Storytelling."}
            </p>
          </div>

          {/* Horizontal Stats Row */}
          <div className="flex flex-row border border-[var(--card-border)] rounded-2xl bg-[var(--card-bg)] overflow-hidden shadow-xl mt-4 divide-x divide-[var(--card-border)]">
            {(aboutData?.stats || [
              { end: 1400, label: "Google Reviews", suffix: "+" },
              { end: 350, label: "Projects Completed", suffix: "" },
              { end: 5, label: "Years Experience", suffix: "+" }
            ]).map((stat: any, idx: number) => (
              <StatCounter key={idx} end={stat.end} label={stat.label} suffix={stat.suffix || ""} />
            ))}
          </div>
        </div>
      </div>

      {/* MOBILE VIEW (md:hidden: image on top, narrative & stats stacked below) */}
      <div className="flex flex-col md:hidden max-w-6xl mx-auto gap-8">
        {/* Visual Showcase on top */}
        <Reveal style="diagonal" className="w-full">
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl group border border-[var(--card-border)] w-full">
            <Image
              data-edit-id="about.image"
              src={aboutData?.image || "/img/exp.jpg"}
              alt="SK Studio Pune Studio Session"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
            
            {/* Tag Overlay */}
            <div className="absolute bottom-4 left-4 flex flex-col gap-1">
              <span className="text-[10px] font-semibold tracking-widest text-[var(--accent)] font-mono uppercase">
                {aboutData?.established || "Established 2016"}
              </span>
              <h4 className="text-base font-bold text-white font-display">
                {aboutData?.awardLabel || "Pune's Highest Rated Firm"}
              </h4>
            </div>
          </div>
        </Reveal>

        {/* Narrative below image */}
        <div className="flex flex-col gap-4">
          <span className="text-[10px] font-semibold tracking-[0.3em] text-[var(--accent)] uppercase font-mono">
            {aboutData?.tag || "CONFIDENT STUDIO STORY"}
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight text-[var(--foreground)] font-display leading-[1.15]">
            {aboutData?.title || "Crafting Unforgettable Visual Stories. Professional Excellence."}
          </h2>

          <div className="text-gray-600 dark:text-gray-300 flex flex-col gap-3 font-light leading-relaxed text-sm">
            <p>
              {aboutData?.p1 || "SK Studio Pune is a distinguished visual arts firm known for capturing unforgettable moments with cinematic precision, utilizing best-in-class props, sets, and styling."}
            </p>
            <p>
              {aboutData?.p2 || "With over 1,400+ positive reviews, we stand proud as one of Pune's most-rated photography firms."}
            </p>
            <p className="font-sans font-medium text-[var(--accent)] italic">
              {aboutData?.p3 || "Dedicated to Precision, Artistry & Timeless Storytelling."}
            </p>
          </div>
        </div>

        {/* Stats stacked vertically */}
        <div className="flex flex-col border border-[var(--card-border)] rounded-2xl bg-[var(--card-bg)] divide-y divide-[var(--card-border)] overflow-hidden shadow-xl">
          {(aboutData?.stats || [
            { end: 1400, label: "Google Reviews", suffix: "+" },
            { end: 350, label: "Projects Completed", suffix: "" },
            { end: 5, label: "Years Experience", suffix: "+" }
          ]).map((stat: any, idx: number) => (
            <StatCounter key={idx} end={stat.end} label={stat.label} suffix={stat.suffix || ""} />
          ))}
        </div>
      </div>
    </section>
  );
}
