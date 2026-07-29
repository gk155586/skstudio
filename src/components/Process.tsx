"use client";

import React, { useState } from "react";
import { MessageSquare, Layers, Camera, PenTool, CheckCircle, HelpCircle } from "lucide-react";
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
  MessageSquare: <MessageSquare size={24} />,
  Layers: <Layers size={24} />,
  Camera: <Camera size={24} />,
  PenTool: <PenTool size={24} />,
  CheckCircle: <CheckCircle size={24} />
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
      description: "We align on props, dedicated gown collections, outfits, and location setups beforehand.",
    },
    {
      number: "02",
      icon: "Layers",
      title: "Setup & Style",
      description: "Our production designers build bespoke backdrops and curate wraps tailored to the theme.",
    },
    {
      number: "03",
      icon: "Camera",
      title: "The Shoot Day",
      description: "A comfortable, temperature-controlled, award-winning shoot experience for your family.",
    },
    {
      number: "04",
      icon: "PenTool",
      title: "Cinematic Editing",
      description: "Applying award-winning filters, retouching, and matching color profiles.",
    },
    {
      number: "05",
      icon: "CheckCircle",
      title: "Premium Delivery",
      description: "Receive wooden bound layflat photo books and downloadable digital galleries.",
    },
  ];

  const steps: Step[] = rawSteps.map((step: any) => ({
    number: step.number,
    icon: iconMap[step.icon] || <HelpCircle size={24} />,
    title: step.title,
    description: step.description
  }));

  return (
    <section id="process" className="py-24 px-6 md:px-12 bg-[var(--background)] border-t border-[var(--card-border)] relative overflow-hidden">
      <div className="absolute bottom-0 right-10 w-96 h-96 rounded-full bg-[var(--accent)] opacity-[0.01] blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto flex flex-col gap-16">
        <div className="flex flex-col items-center text-center">
          <span className="text-xs font-semibold tracking-[0.3em] text-[var(--accent)] uppercase font-mono mb-4">
            {processData?.tag || "Studio Workflow"}
          </span>
          <TextReveal
            text={processData?.title || "Our Production Process"}
            style="mask"
            className="text-3xl md:text-5xl font-extrabold tracking-tight text-[var(--foreground)] font-display"
          />
          <p className="text-gray-600 dark:text-gray-300 max-w-xl mt-4 font-sans font-light">
            {processData?.description || "Bespoke, professional, and detailed steps from planning to delivering layflat albums."}
          </p>
        </div>

        {/* Vertical Zig-Zag Timeline Layout */}
        <div className="relative mt-12 w-full">
          {/* Connecting Vertical Line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-[2px] bg-[var(--card-border)] md:-translate-x-1/2 z-0" />

          <div className="flex flex-col gap-12 relative z-10 w-full">
            {steps.map((step, idx) => {
              const isHovered = hoveredIdx === idx;
              const isEven = idx % 2 === 0;

              return (
                <Reveal
                  key={step.number}
                  style={isEven ? "slide-right" : "slide-left"}
                  delayMs={idx * 150}
                  className="w-full flex"
                >
                  <div
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    className={`relative flex flex-col md:flex-row w-full group ${
                      isEven ? "md:flex-row-reverse" : ""
                    }`}
                  >
                    {/* Empty Space for layout balancing on Desktop */}
                    <div className="hidden md:block w-1/2" />

                    {/* Timeline Node (Icon) */}
                    <div className={`absolute left-6 md:left-1/2 top-6 md:top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center border-[3px] transition-all duration-500 bg-[var(--background)] z-20 shadow-lg group-hover:scale-125 group-hover:rotate-12 ${
                      isHovered
                        ? "border-[var(--accent)] shadow-[0_0_20px_rgba(209,176,108,0.5)] text-[var(--accent)]"
                        : "border-[var(--card-border)] text-gray-400 group-hover:border-[var(--accent)]/50 group-hover:text-[var(--accent)]"
                    }`}>
                      {step.icon}
                    </div>

                    {/* Content Card */}
                    <div className={`w-full md:w-1/2 flex ${isEven ? "md:pr-16" : "md:pl-16"} pl-20 md:pl-${isEven ? "0" : "16"} py-2`}>
                      <div className={`flex flex-col gap-3 p-8 bg-[var(--card-bg)]/80 backdrop-blur-md border border-[var(--card-border)] rounded-3xl transition-all duration-500 shadow-xl w-full relative overflow-hidden group-hover:border-[var(--accent)]/40 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] group-hover:-translate-y-2 ${
                        isEven ? "text-left md:text-right" : "text-left"
                      }`}>
                        {/* Subtle background glow on hover */}
                        <div className={`absolute top-0 w-32 h-32 bg-[var(--accent)]/10 rounded-full blur-3xl transition-all duration-700 pointer-events-none ${
                          isEven ? "right-0 translate-x-1/2" : "left-0 -translate-x-1/2"
                        } ${isHovered ? "opacity-100" : "opacity-0"}`} />

                        <span className="text-xs font-mono text-[var(--accent)] font-extrabold uppercase tracking-[0.2em] relative z-10">
                          Step {step.number}
                        </span>
                        <h3 className="text-xl font-bold text-[var(--foreground)] font-display leading-tight relative z-10 group-hover:text-[var(--accent)] transition-colors">
                          {step.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-sans font-light relative z-10">
                          {step.description}
                        </p>
                      </div>
                    </div>
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
