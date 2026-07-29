import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Layers, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function BabySegmentPage() {
  const segments = [
    {
      title: "Newborn Shoot",
      href: "/services/newborn",
      image: "/img/gallery/newborn/newborn-cover.jpeg",
      desc: "Capturing the purest initial days of your newborn in safe wrapping styles by certified baby safety handlers.",
    },
    {
      title: "Baby Indoor",
      href: "/services/baby-indoor",
      image: "/img/gallery/baby-indoor/IMG_2457.JPG.jpeg",
      desc: "Delightful baby indoor studio sessions with sterilized themed props and temperature-controlled settings.",
    },
    {
      title: "Baby Outdoor",
      href: "/services/baby-outdoor",
      image: "/img/gallery/baby-outdoor/1/SKO03266.JPG",
      desc: "Vibrant baby outdoor photography capturing playful giggles and candid moments amidst green parks and sunny fields.",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--accent)] selection:text-black font-sans">
      <Navbar />

      <main className="pt-28 md:pt-32 pb-20 px-4 md:px-12 max-w-7xl mx-auto flex flex-col gap-8 md:gap-12">
        <Link
          href="/#portfolio"
          className="flex items-center gap-2 text-[11px] md:text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-[var(--accent)] transition-colors w-fit select-none"
        >
          <ArrowLeft size={14} /> Back To Portfolio
        </Link>

        <div className="flex flex-col gap-2 md:gap-3 max-w-2xl">
          <span className="text-[10px] md:text-xs font-semibold tracking-[0.25em] text-[var(--accent)] uppercase font-mono flex items-center gap-1.5">
            <Layers size={13} /> Exclusive Categories
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight font-display text-[var(--foreground)] leading-tight">
            Baby & Kids Shoots
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed font-light">
            Delightful baby and kids photography sessions capturing pure newborn milestones and giggles in curated indoor and outdoor setups.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {segments.map((segment) => (
            <Link
              key={segment.href}
              href={segment.href}
              className="group relative aspect-[4/5] overflow-hidden rounded-3xl bg-neutral-900 border border-[var(--card-border)] shadow-md flex flex-col justify-end transition-transform hover:-translate-y-2 select-none"
            >
              <Image
                src={segment.image}
                alt={segment.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
              
              <div className="relative z-10 p-6 sm:p-8 flex flex-col gap-2">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                  {segment.title}
                </h3>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                  {segment.desc}
                </p>
                <div className="mt-4 flex items-center gap-2 text-[var(--accent)] text-xs font-bold uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                  View Gallery <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
