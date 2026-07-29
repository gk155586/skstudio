import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Tag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PortfolioDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // Format title from slug
  const title = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" & ");

  // Map slugs to category details
  const detailsMap: Record<string, { desc: string; date: string; category: string; location: string }> = {
    "eyara": {
      desc: "An exquisite, high-concept photo session showcasing Eyara in elegant studio and themed environments.",
      date: "February 2026",
      category: "Featured Portfolio",
      location: "SK Studio, Pune",
    },
    "veena-aniket": {
      desc: "Veena and Aniket’s romantic celebration of love, captured with traditional outfits and premium backdrop lighting.",
      date: "November 4, 2025",
      category: "Wedding Shoot",
      location: "Pimpri, Pune",
    },
    "kunal-niddhi": {
      desc: "A lively wedding event capturing Kunal & Niddhi. Warm lighting and candid captures showing raw emotions.",
      date: "December 1, 2025",
      category: "Wedding Shoot",
      location: "Chinchwad, Pune",
    },
    "ruchi-pranav": {
      desc: "Pranav & Ruchi’s destination wedding theme showing premium cinematic layouts and aerial drone details.",
      date: "January 14, 2026",
      category: "Wedding Shoot",
      location: "Mulshi Lake, Pune",
    },
    "laveena-yash": {
      desc: "Capturing the bright traditional smiles of Laveena & Yash under premium floral wedding arches.",
      date: "February 22, 2026",
      category: "Wedding Shoot",
      location: "Kalyani Nagar, Pune",
    },
  };

  const currentDetails = detailsMap[slug] || {
    desc: `Bespoke, cinematic photoshoot album highlighting ${title} capturing candid raw expressions.`,
    date: "Recent Session",
    category: "Photoshoot Session",
    location: "PCMC, Pune",
  };

  let images: string[] = [];
  if (slug === "eyara") {
    images = [
      "/img/gallery/Eyara/SK_09102 copy.jpg",
      "/img/gallery/Eyara/SK_09111 copy.jpg",
      "/img/gallery/Eyara/SK_09128 copy.jpg",
      "/img/gallery/Eyara/SK_09132 copy.jpg",
      "/img/gallery/Eyara/SK_09135 copy.jpg",
      "/img/gallery/Eyara/SK_09145 copy.jpg",
      "/img/gallery/Eyara/SK_09152 copy.jpg",
      "/img/gallery/Eyara/SK_09179 copy.jpg",
      "/img/gallery/Eyara/SK_09188 copy.jpg",
      "/img/gallery/Eyara/SK_09202 copy.jpg",
      "/img/gallery/Eyara/SK_09219.JPG",
      "/img/gallery/Eyara/SK_09222 copy.jpg",
      "/img/gallery/Eyara/SK_09224 copy.jpg",
      "/img/gallery/Eyara/SK_09234 copy.jpg",
      "/img/gallery/Eyara/SK_09241.JPG",
      "/img/gallery/Eyara/SK_09247 copy.jpg",
      "/img/gallery/Eyara/SK_09267 copy.jpg",
      "/img/gallery/Eyara/SK_09275 copy.jpg",
    ];
  } else {
    images = Array.from({ length: 15 }, (_, i) => `/img/wedding-seg/${slug}/${i + 1}.jpg`);
  }

  return (
    <div className="min-h-screen bg-white text-black selection:bg-[var(--accent)] selection:text-black font-sans">
      <Navbar />

      <main className="pt-28 pb-16 px-6 md:px-12 max-w-6xl mx-auto flex flex-col gap-10">
        
        {/* Back Link */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-black transition-colors w-fit select-none"
        >
          <ArrowLeft size={16} /> Back To Home
        </Link>

        {/* Title and metadata block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--card-border)] pb-8">
          <div className="flex flex-col gap-3 max-w-2xl">
            <span className="text-xs font-semibold tracking-[0.3em] text-[var(--accent)] uppercase font-mono">
              Portfolio Highlight
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-display text-[#1c1a17]">
              {title}
            </h1>
            <p className="text-gray-600 font-sans font-light leading-relaxed mt-2 text-base md:text-lg">
              {currentDetails.desc}
            </p>
          </div>

          {/* Telemetry metadata tags */}
          <div className="flex flex-col gap-4 bg-[var(--card-bg)] border border-[var(--card-border)] p-6 rounded-2xl min-w-[250px] shadow-sm">
            <div className="flex items-center gap-3 text-xs text-[var(--foreground)]">
              <Tag size={16} className="text-[var(--accent)]" />
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-mono uppercase">Category</span>
                <span className="font-semibold">{currentDetails.category}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-[var(--foreground)]">
              <Calendar size={16} className="text-[var(--accent)]" />
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-mono uppercase">Session Date</span>
                <span className="font-semibold">{currentDetails.date}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-[var(--foreground)]">
              <MapPin size={16} className="text-[var(--accent)]" />
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-mono uppercase">Location</span>
                <span className="font-semibold">{currentDetails.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Grid (Clear, beautiful masonry display) */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold font-display uppercase text-[var(--foreground)] tracking-wider border-l-2 border-[var(--accent)] pl-3 mb-2">
            Captured Gallery (15 Shots)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {images.map((url, idx) => (
              <div
                key={idx}
                className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-[var(--card-border)] shadow-md group bg-[var(--card-bg)]"
              >
                <Image
                  src={url}
                  alt={`${title} Wedding Session Shot ${idx + 1}`}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            ))}
          </div>
        </div>

        {/* Booking CTA card */}
        <div className="mt-12 p-8 md:p-12 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] flex flex-col md:flex-row items-center justify-between gap-8 shadow-md">
          <div className="flex flex-col gap-3 max-w-lg">
            <h3 className="text-2xl font-bold font-display text-[var(--foreground)]">
              Want a similar session matching your concepts?
            </h3>
            <p className="text-sm text-gray-500 font-sans font-light">
              Connect with our production coordinators to outline outfits, set themes, and secure customized layflat wedding books.
            </p>
          </div>
          <Link
            href="/#contact"
            className="px-8 py-4 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-black font-semibold text-xs tracking-widest uppercase transition-all duration-300 shadow-lg select-none whitespace-nowrap"
          >
            Inquire For Rates
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  );
}
