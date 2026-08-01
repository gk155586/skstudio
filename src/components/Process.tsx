"use client";

import React, { useState } from "react";
import { MessageSquare, Layers, Camera, PenTool, CheckCircle, HelpCircle, ArrowRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import TextReveal from "@/components/TextReveal";
import { useContent } from "@/components/Providers";

interface Step {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const iconMap: Record<string, React.ReactNode> = {
  MessageSquare: <MessageSquare size={20} />,
  Layers: <Layers size={20} />,
  Camera: <Camera size={20} />,
  PenTool: <PenTool size={20} />,
  CheckCircle: <CheckCircle size={20} />
};

export default function Process() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const { content } = useContent();
  const processData = content?.process;

  const rawSteps = processData?.steps || [
    {
      number: "01",
      icon: "MessageSquare",
      title: "Concept & Consult",
      description: "We align on props, dedicated gown collections, outfits, and location setups.",
    },
    {
      number: "02",
      icon: "Layers",
      title: "Setup & Style",
      description: "Our designers build bespoke backdrops and curate wraps tailored to the theme.",
    },
    {
      number: "03",
      icon: "Camera",
      title: "The Shoot Day",
      description: "A comfortable, temperature-controlled experience for your family.",
    },
    {
      number: "04",
      icon: "PenTool",
      title: "Cinematic Editing",
      description: "Applying award-winning filters, retouching, and color profile matching.",
    },
    {
      number: "05",
      icon: "CheckCircle",
      title: "Premium Delivery",
      description: "Receive wooden layflat albums and downloadable digital galleries.",
    },
  ];

  const steps: Step[] = rawSteps.map((step: any) => ({
    number: step.number,
    icon: iconMap[step.icon] || <HelpCircle size={20} />,
    title: step.title,
    description: step.description
  }));

  return (
    <section id="process" className="py-10 md:py-14 px-4 md:px-12 bg-[var(--background)] border-t border-[var(--card-border)] relative overflow-hidden">
      <div className="absolute bottom-0 right-10 w-80 h-80 rounded-full bg-[var(--accent)] opacity-[0.02] blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto flex flex-col gap-8 md:gap-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <span className="text-xs font-semibold tracking-[0.3em] text-[var(--accent)] uppercase font-mono mb-2">
            {processData?.tag || "Studio Workflow"}
          </span>
          <TextReveal
            text={processData?.title || "Our Production Process"}
            style="mask"
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--foreground)] font-display"
          />
          <p className="text-gray-500 dark:text-gray-400 max-w-lg mt-2 text-xs sm:text-sm font-sans font-light leading-relaxed">
            {processData?.description || "Bespoke, professional, and detailed steps from planning to delivering layflat albums."}
          </p>
        </div>

        {/* Compact 5-Step Process Pipeline */}
        <div className="relative w-full">
          {/* Subtle Connecting Line for Desktop */}
          <div className="hidden lg:block absolute top-[52px] left-[8%] right-[8%] h-[2px] bg-gradient-to-r from-transparent via-[var(--accent)]/30 to-transparent z-0 pointer-events-none" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-5 relative z-10 w-full">
            {steps.map((step, idx) => {
              const isHovered = hoveredIdx === idx;

              return (
                <Reveal
                  key={step.number}
                  style="slide-up"
                  delayMs={idx * 80}
                  className="w-full flex"
                >
                  <div
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    className="group relative flex flex-col w-full p-5 rounded-2xl bg-[var(--card-bg)]/90 backdrop-blur-md border border-[var(--card-border)] hover:border-[var(--accent)]/60 transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1.5 overflow-hidden"
                  >
                    {/* Top Row: Step Badge & Icon */}
                    <div className="flex items-center justify-between w-full mb-3">
                      <span className="text-xs font-mono font-black text-[var(--accent)] tracking-widest px-2.5 py-1 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20">
                        {step.number}
                      </span>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        isHovered
                          ? "bg-[var(--accent)] text-black scale-110 shadow-md"
                          : "bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20"
                      }`}>
                        {step.icon}
                      </div>
                    </div>

                    {/* Step Title */}
                    <h3 className="text-base font-extrabold text-[var(--foreground)] font-display leading-snug group-hover:text-[var(--accent)] transition-colors">
                      {step.title}
                    </h3>

                    {/* Step Description */}
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-sans leading-relaxed mt-2 flex-1">
                      {step.description}
                    </p>

                    {/* Subtle Hover Glow Line at bottom */}
                    <div className={`absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--accent)] transition-opacity duration-300 ${
                      isHovered ? "opacity-100" : "opacity-0"
                    }`} />
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
