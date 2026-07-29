"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import TextReveal from "@/components/TextReveal";
import { useContent } from "@/components/Providers";

interface WorkItem {
  id: string;
  title: string;
  category: "wedding" | "maternity" | "baby";
  image: string;
  href: string;
  gridClass: string;
}

const defaultCategories = [
  { slug: "pre-wedding", name: "Pre-Wedding Shoot", category: "wedding", image: "/img/gallery/pre-wedding/pre-wedding-cover.jpg" },
  { slug: "haldi", name: "Haldi Shoot", category: "wedding", image: "/img/gallery/haldi/haldi-cover.jpg" },
  { slug: "wedding", name: "Wedding Shoot", category: "wedding", image: "/img/gallery/wedding/wedding-cover.jpg" },
  { slug: "maternity-indoor", name: "Maternity Indoor", category: "maternity", image: "/img/gallery/maternity-indoor/maternity-indoor-cover.jpeg" },
  { slug: "maternity-outdoor", name: "Maternity Outdoor", category: "maternity", image: "/img/gallery/maternity-outdoor/1/SKO00321.JPG" },
  { slug: "baby-indoor", name: "Baby Indoor", category: "baby", image: "/img/gallery/baby-indoor/IMG_2457.JPG.jpeg" },
  { slug: "baby-outdoor", name: "Baby Outdoor", category: "baby", image: "/img/gallery/baby-outdoor/1/SKO03266.JPG" },
  { slug: "newborn", name: "Newborn Shoot", category: "baby", image: "/img/gallery/newborn/newborn-cover.jpeg" },
  { slug: "theme", name: "Theme Shoots", category: "theme", image: "/img/gallery/Themes/SK_00064.JPG" },
];

export default function Work() {
  const [filter, setFilter] = useState<"all" | string>("all");
  const { content } = useContent();

  const { portfolioItems, categories } = useMemo(() => {
    const galleries = content?.categoryGalleries || {};

    const items: WorkItem[] = defaultCategories.map((cat, index) => {
      const customImage = galleries[cat.slug]?.images?.[0]?.url;
      return {
        id: `work-${cat.slug}`,
        title: cat.name,
        category: cat.category as any,
        image: customImage || cat.image,
        href: `/services/${cat.slug}`,
        gridClass: index % 3 === 0 ? "col-span-1 md:col-span-2 row-span-1 md:row-span-2" : "col-span-1 row-span-1",
      };
    });

    // Inject the Photo Frames Module into the Grid
    items.push({
      id: `work-photo-frames`,
      title: "Custom Photo Frames",
      category: "frames" as any,
      image: "/images/frames-preview.jpg",
      href: "/photo-frames",
      gridClass: "col-span-1 md:col-span-1 row-span-1",
    });

    return {
      portfolioItems: items,
      categories: ["wedding", "maternity", "baby", "theme", "frames"],
    };
  }, [content]);


  const filteredItems =
    filter === "all" ? portfolioItems : portfolioItems.filter((i) => i.category === filter);

  return (
    <section id="portfolio" className="pt-12 pb-10 md:pt-20 md:pb-16 px-4 md:px-12 bg-[var(--background)] border-t border-[var(--card-border)] relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full bg-[var(--accent)] opacity-[0.02] blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto flex flex-col gap-2 md:gap-2">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
          <div className="flex flex-col gap-1.5 md:gap-2">
            <TextReveal
              text="Selected Work"
              style="chars"
              className="text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight text-[var(--foreground)] font-display"
            />
          </div>

          {/* Filtering buttons */}
          {/* Desktop view filters (pills - Untouched for Desktop) */}
          <div className="hidden md:flex flex-wrap items-center justify-center gap-1.5 border border-[var(--card-border)] rounded-[24px] p-1 bg-[var(--card-bg)] max-w-full w-full md:w-fit">
            {["all", ...categories].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`relative px-4 md:px-6 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 select-none overflow-hidden ${
                  filter === cat
                    ? "text-black shadow-[0_0_15px_rgba(209,176,108,0.4)] border-transparent"
                    : "text-gray-500 dark:text-gray-400 hover:text-[var(--foreground)] border-transparent hover:border-[var(--card-border)]"
                }`}
              >
                {filter === cat && (
                  <div className="absolute inset-0 bg-[var(--accent)] -z-10 animate-fade-in" />
                )}
                <span className="relative z-10">{cat}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mobile view filter tabs (Horizontal scrolling pills for mobile) */}
        <div className="flex md:hidden overflow-x-auto gap-2 py-1 no-scrollbar -mx-4 px-4 select-none">
          {[
            { id: "all", label: "ALL" },
            { id: "wedding", label: "WEDDING" },
            { id: "maternity", label: "MATERNITY" },
            { id: "baby", label: "BABY & KIDS" },
            { id: "theme", label: "THEME" },
            { id: "frames", label: "FRAMES" }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-4 py-2 rounded-full text-[11px] font-extrabold tracking-wider uppercase whitespace-nowrap transition-all duration-300 shrink-0 ${
                filter === cat.id
                  ? "bg-[var(--accent)] text-black shadow-md scale-105"
                  : "bg-[var(--card-bg)] text-gray-400 border border-[var(--card-border)] active:scale-95"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* MOBILE VIEW PORTFOLIO CARDS */}
        <div className="flex md:hidden flex-col gap-3.5 w-full">
          {filteredItems.map((item, idx) => (
            <Reveal key={`mob-${item.id}`} style="diagonal" delayMs={idx * 30}>
              <Link
                href={item.href}
                className="flex flex-row items-center gap-3.5 p-3.5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-lg hover:border-[var(--accent)]/60 active:scale-[0.98] transition-all duration-300 w-full group overflow-hidden"
              >
                {/* Left hand side image / thumbnail */}
                <div className="relative w-[42%] aspect-[4/3] rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-md bg-black">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    unoptimized
                    loading="eager"
                    decoding="async"
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-110"
                    sizes="45vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300" />
                </div>

                {/* Right hand side category name and title */}
                <div className="flex-1 flex flex-col justify-between py-1 pr-1 min-w-0">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-mono tracking-widest text-[var(--accent)] uppercase font-semibold">
                      {item.category}
                    </span>
                    <h4 className="text-sm font-extrabold text-[var(--foreground)] font-display leading-snug line-clamp-2">
                      {item.title}
                    </h4>
                  </div>
                  <div className="text-[10px] font-bold text-[var(--accent)] flex items-center gap-1.5 font-mono uppercase mt-2.5 group-hover:translate-x-1 transition-transform duration-300">
                    View Portfolio &rarr;
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        {/* DESKTOP/LAPTOP PERFECT GRID LAYOUT */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-24 gap-x-12 lg:gap-x-24 w-full mt-12 lg:mt-24 px-4 lg:px-12">
          {filteredItems.map((item, idx) => {
            // Uniform aspect ratio based on Pre-Wedding image size
            const aspectClass = "aspect-[3/5]";

            return (
              <Reveal
                key={item.id}
                style="slide-up"
                className="group relative flex flex-col w-full"
                delayMs={(idx % 3) * 150}
              >
                <Link href={item.href} className="block w-full relative outline-none">
                  
                  {/* Decorative huge background number for editorial look */}
                  <div className="absolute -top-16 -left-8 md:-left-12 text-[150px] font-black text-[var(--accent)] opacity-[0.03] font-display pointer-events-none select-none z-0 transition-transform duration-700 group-hover:-translate-y-4 group-hover:opacity-[0.08]">
                    0{idx + 1}
                  </div>

                  {/* Image Container */}
                  <div className={`relative w-full ${aspectClass} overflow-hidden rounded-md z-10 shadow-2xl group-hover:shadow-[0_30px_60px_rgba(0,0,0,0.6)] transition-shadow duration-[1000ms] border border-white/5`}>
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      unoptimized
                      loading="lazy"
                      className="object-cover object-center transition-transform duration-[2000ms] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110"
                      sizes="33vw"
                    />
                    
                    {/* Minimalist overlay */}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-700" />
                  </div>

                  {/* Editorial Typography (Pushed down below the image) */}
                  <div className="relative z-20 mt-8 md:mt-10 md:ml-4 group-hover:md:ml-8 transition-all duration-700 ease-out bg-[var(--background)]/80 backdrop-blur-sm p-4 rounded-xl border border-[var(--card-border)]/50 md:border-none md:bg-transparent md:backdrop-blur-none md:p-0">
                    <span className="text-xs font-mono tracking-[0.3em] text-[var(--accent)] uppercase font-extrabold mb-3 block">
                      {item.category}
                    </span>
                    <h4 className="text-3xl lg:text-4xl font-black text-[var(--foreground)] group-hover:text-[var(--accent)] font-display leading-[1.1] tracking-tighter transition-colors duration-500 drop-shadow-md">
                      {item.title}
                    </h4>
                    
                    <div className="mt-6 flex items-center gap-4 text-xs font-bold uppercase tracking-[0.2em] text-gray-500 group-hover:text-[var(--foreground)] transition-colors duration-300">
                      <span className="w-8 h-[2px] bg-[var(--accent)] group-hover:w-16 transition-all duration-700 ease-out" />
                      Explore Story
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
