"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import Reveal from "@/components/Reveal";
import TextReveal from "@/components/TextReveal";
import { useContent } from "@/components/Providers";

interface Review {
  id: number;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  text: string;
}

export default function Testimonials() {
  const [activeIdx, setActiveIdx] = useState(0);
  const { content } = useContent();
  const reviewsData = content?.testimonials || [];

  const reviews: Review[] = reviewsData.length > 0 ? reviewsData : [
    {
      id: 1,
      name: "Swati Agrawal",
      role: "Google Reviews",
      avatar: "/img/clients/1.jpg",
      rating: 5,
      text: "Amazing experience !! Kids photoshoot is never easy, but the team did it with so much grace. I just loved the way SK Studio team handled my kid and captured the beautiful pictures which I will cherish for life. My baby picture turned out to be superb. Thank you so much for your hard work and dedication.",
    },
    {
      id: 2,
      name: "Anisha Gopinathan",
      role: "Google Reviews",
      avatar: "/img/clients/1.jpg",
      rating: 5,
      text: "We had an amazing experience for our maternity photoshoot! Unfortunately, I couldn't travel to the studio but the team was so helpful they came for a home shoot with all required equipment and props and captured beautiful pictures. The photographer was incredibly talented and made us feel so comfortable throughout.",
    },
    {
      id: 3,
      name: "Prasad More",
      role: "Google Reviews",
      avatar: "/img/clients/1.jpg",
      rating: 5,
      text: "We had an amazing experience with SK Studio for our maternity photoshoot! The photographer was incredibly talented and made us feel so comfortable throughout the session. The photos turned out beautifully, capturing such precious moments that we'll cherish forever. Highly recommend!",
    },
  ];

  // Auto rotate reviews
  useEffect(() => {
    if (reviews.length === 0) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % reviews.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [reviews.length]);

  const handlePrev = () => {
    setActiveIdx((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % reviews.length);
  };

  const current = reviews[activeIdx] || { id: 0, name: "", role: "", avatar: "", rating: 5, text: "" };

  // Marquee builders
  const marqueeClients = [
    "Force Motors",
    "Nirman Greens",
    "GK Builders",
    "Mahindra & Mahindra",
    "Bajaj Auto",
    "Ghar Soaps",
    "GVR Group",
    "One Group",
    "Sonigra Group",
    "Aswani Associates",
  ];

  return (
    <section id="testimonials" className="py-10 md:py-24 px-4 md:px-12 bg-[var(--background)] border-t border-[var(--card-border)] relative overflow-hidden">
      <div className="absolute top-1/3 left-0 w-80 h-80 rounded-full bg-[var(--accent)] opacity-[0.02] blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto flex flex-col gap-8 md:gap-16">
        <div className="flex flex-col items-center text-center">
          <span className="text-[10px] md:text-xs font-semibold tracking-[0.3em] text-[var(--accent)] uppercase font-mono mb-2 md:mb-4">
            Client Stories
          </span>
          <TextReveal
            text="What People Say"
            style="mask"
            className="text-3xl md:text-5xl font-extrabold tracking-tight font-display bg-clip-text text-transparent bg-gradient-to-r from-[var(--foreground)] to-[var(--foreground)]/60"
          />
        </div>

        {/* Carousel Block */}
        <Reveal style="blur" className="max-w-4xl mx-auto w-full relative group">
          {/* Subtle glowing shadow behind the card */}
          <div className="absolute inset-0 bg-[var(--accent)]/5 rounded-3xl blur-2xl group-hover:bg-[var(--accent)]/10 transition-colors duration-700 pointer-events-none" />
          
          <div className="relative glass border border-[var(--glass-border)] rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10 w-full bg-[var(--card-bg)]/80 backdrop-blur-xl overflow-hidden group-hover:border-[var(--accent)]/40 transition-all duration-500">
            {/* Background Decorative Quote */}
            <div className="absolute top-0 right-8 -translate-y-4 text-[var(--accent)] opacity-5 pointer-events-none rotate-12 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
              <svg width="180" height="180" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.017 21L16.417 14.5C16.417 14.5 13.9 14.2 13.9 10.5C13.9 6.8 17.5 3 21.017 3V7.5C21.017 7.5 18.5 7.8 18.5 10.5C18.5 13.2 21.017 13.5 21.017 13.5L18.517 21H14.017ZM2.017 21L4.417 14.5C4.417 14.5 1.9 14.2 1.9 10.5C1.9 6.8 5.5 3 9.017 3V7.5C9.017 7.5 6.5 7.8 6.5 10.5C6.5 13.2 9.017 13.5 9.017 13.5L6.517 21H2.017Z" />
              </svg>
            </div>

            {/* Rating stars */}
            <div className="flex-1 flex flex-col gap-3 md:gap-4 w-full">
              <div className="flex items-center gap-1">
                {[...Array(current.rating)].map((_, i) => (
                  <Star key={i} size={15} fill="var(--accent)" stroke="var(--accent)" />
                ))}
              </div>
              <p className="text-sm sm:text-base md:text-xl text-[var(--foreground)] font-display italic leading-relaxed font-light">
                &quot;{current.text}&quot;
              </p>
              <div className="flex items-center justify-between w-full mt-2 pt-3 border-t border-[var(--card-border)] md:border-t-0 md:pt-0">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border border-[var(--accent)] bg-[var(--background)] shrink-0">
                    <Image src={current.avatar} alt={current.name} fill className="object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <h4 className="text-xs sm:text-sm font-bold text-[var(--foreground)] font-display leading-tight">{current.name}</h4>
                    <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-mono">{current.role}</span>
                  </div>
                </div>

                {/* Mobile & Desktop Nav buttons */}
                <div className="flex items-center gap-2 select-none shrink-0">
                  <button
                    onClick={handlePrev}
                    aria-label="Previous Review"
                    className="p-2 md:p-3 rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)] active:scale-95 transition-all duration-300 clickable"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={handleNext}
                    aria-label="Next Review"
                    className="p-2 md:p-3 rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)] active:scale-95 transition-all duration-300 clickable"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Brand Marquee */}
        <div className="w-full overflow-hidden py-6 border-y border-[var(--card-border)] relative">
          <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-[var(--background)] to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-[var(--background)] to-transparent z-10 pointer-events-none" />

          <div className="animate-marquee gap-16 items-center">
            {/* First sequence */}
            {marqueeClients.map((client, idx) => (
              <span
                key={`m1-${idx}`}
                className="text-lg md:text-2xl font-bold tracking-[0.2em] uppercase font-accent text-[var(--foreground)]/10 hover:text-[var(--accent)] transition-colors select-none"
              >
                {client}
              </span>
            ))}
            {/* Second identical sequence for seamless loop */}
            {marqueeClients.map((client, idx) => (
              <span
                key={`m2-${idx}`}
                className="text-lg md:text-2xl font-bold tracking-[0.2em] uppercase font-accent text-[var(--foreground)]/10 hover:text-[var(--accent)] transition-colors select-none"
              >
                {client}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
