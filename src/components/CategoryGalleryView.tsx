"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, ZoomIn, ZoomOut, Download, X, ChevronLeft, ChevronRight, Layers } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export interface GalleryAlbum {
  id: string;
  title: string;
  coverImage: string;
  images: string[];
  photoCount: number;
}

interface SubCategory {
  name: string;
  key: string;
  images: string[];
  albums?: GalleryAlbum[];
}

interface CategoryGalleryViewProps {
  title: string;
  description: string;
  banner: string;
  features: string[];
  images?: string[];
  albums?: GalleryAlbum[];
  subCategories?: SubCategory[];
}

interface GalleryImageCardProps {
  idx: number;
  url: string;
  title: string;
  openLightbox: (index: number, e: React.MouseEvent<HTMLDivElement>) => void;
  pad: (n: number) => string;
}

// Native React Image Card with instant 60fps rendering & zero scroll blur
function GalleryImageCard({ idx, url, title, openLightbox, pad }: GalleryImageCardProps) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [url]);

  return (
    <div
      className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-900 border border-[var(--card-border)] shadow-md group cursor-pointer active:scale-95 transition-all duration-300 select-none"
      onClick={(e) => openLightbox(idx, e)}
    >
      {!loaded && (
        <div className="absolute inset-0 bg-neutral-800 animate-pulse flex items-center justify-center z-0">
          <div className="w-5 h-5 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
        </div>
      )}
      <img
        ref={imgRef}
        src={url}
        loading="eager"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 relative z-10 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        alt={`${title} Frame ${idx + 1}`}
      />
    </div>
  );
}

// Subfolder Shoot Session Card (60fps Right-to-Left Slide Carousel Engine with Progress Dots)
function ShootAlbumCard({
  album,
  albumIdx,
  openAlbumLightbox
}: {
  album: GalleryAlbum;
  albumIdx: number;
  openAlbumLightbox: (album: GalleryAlbum, initialIdx: number) => void;
}) {
  // Deduplicate images to guarantee no repeating slides
  const images = useMemo(() => {
    const raw = album.images && album.images.length > 0 ? album.images : [album.coverImage];
    const unique = Array.from(new Set(raw.filter(Boolean)));
    return unique.length > 0 ? unique : [album.coverImage];
  }, [album.images, album.coverImage]);

  const [activeIdx, setActiveIdx] = useState(0);
  const activeIdxRef = useRef(0);
  activeIdxRef.current = activeIdx;

  // Auto-slide every 5 seconds using smooth translateX approach
  useEffect(() => {
    if (images.length <= 1) return;

    const staggerDelay = (albumIdx % 4) * 1000;

    const startTimer = setTimeout(() => {
      const interval = setInterval(() => {
        setActiveIdx(prev => (prev + 1) % images.length);
      }, 5000);

      return () => clearInterval(interval);
    }, staggerDelay);

    return () => clearTimeout(startTimer);
  }, [images.length, albumIdx]);

  return (
    <div
      className="relative flex flex-col rounded-2xl overflow-hidden bg-[var(--card-bg)] border border-[var(--card-border)] shadow-md group cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-[var(--accent)] select-none"
      onClick={() => openAlbumLightbox(album, activeIdx)}
    >
      {/* Top 4:3 Aspect Ratio Smooth Luxury Slider */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/20">
        
        {/* Absolute Slides with Smooth 1s GPU-Accelerated Crossfade */}
        {images.map((imgUrl, i) => (
          <div
            key={i}
            className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out ${
              i === activeIdx ? "opacity-100 scale-100 z-10" : "opacity-0 scale-105 z-0 pointer-events-none"
            }`}
          >
            <img
              src={imgUrl}
              alt={`${album.title} Slide ${i + 1}`}
              className="w-full h-full object-cover object-center block"
              style={{ imageOrientation: "from-image" }}
              loading={i === 0 || i === activeIdx ? "eager" : "lazy"}
              decoding="async"
            />
          </div>
        ))}

        {/* Floating Photo Count Badge */}
        <div className="absolute top-2.5 right-2.5 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold font-mono text-white border border-white/20 flex items-center gap-1 z-20">
          <Layers size={10} className="text-[var(--accent)]" /> {album.photoCount || images.length} Photos
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
          <span className="px-3.5 py-1.5 bg-[var(--accent)] text-black font-extrabold text-[11px] uppercase tracking-wider rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
            View Shoot
          </span>
        </div>

        {/* Bottom Dots Indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-[14px] left-1/2 -translate-x-1/2 flex justify-center items-center gap-2 z-30 pointer-events-none">
            {images.map((_, i) => (
              <span
                key={i}
                className={`rounded-full transition-all duration-500 ${
                  i === activeIdx
                    ? "w-4 h-1.5 bg-[var(--accent)] shadow-md"
                    : "w-1.5 h-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Title & Shoot Details Footer */}
      <div className="p-2 sm:p-3 flex flex-col gap-0.5 bg-[var(--card-bg)] border-t border-[var(--card-border)]">
        <h3 className="text-[11px] sm:text-xs md:text-sm font-extrabold text-[var(--foreground)] truncate font-display group-hover:text-[var(--accent)] transition-colors">
          {album.title}
        </h3>
        <span className="text-[9px] sm:text-[10px] font-mono font-medium text-[var(--foreground)]/50 truncate">
          SK Studio Pune Shoot Session
        </span>
      </div>
    </div>
  );
}

export default function CategoryGalleryView({
  title,
  description,
  banner,
  features,
  images = [],
  albums = [],
  subCategories
}: CategoryGalleryViewProps) {
  const [activeSub, setActiveSub] = useState<string>(subCategories && subCategories.length > 0 ? subCategories[0].key : "");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeAlbumImages, setActiveAlbumImages] = useState<string[]>([]);
  const [activeAlbumTitle, setActiveAlbumTitle] = useState<string>("");
  
  const lbImgRef = useRef<HTMLImageElement | null>(null);

  // Body scroll locking when lightbox is active
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxIndex]);

  // Refs to avoid stale closures
  const lightboxIndexRef = useRef<number | null>(null);
  const activeAlbumImagesRef = useRef<string[]>([]);
  lightboxIndexRef.current = lightboxIndex;
  activeAlbumImagesRef.current = activeAlbumImages;

  const currentSub = subCategories && subCategories.length > 0
    ? subCategories.find(s => s.key === activeSub)
    : null;

  const displayImages = currentSub ? (currentSub.images || []) : images;
  const displayAlbums = currentSub ? (currentSub.albums || []) : albums;

  // Open Lightbox for standard images
  const openLightbox = (index: number, e: React.MouseEvent<HTMLDivElement>) => {
    const uniqueImgs = Array.from(new Set((displayImages || []).filter(Boolean)));
    const finalImgs = uniqueImgs.length > 0 ? uniqueImgs : displayImages;
    setActiveAlbumImages(finalImgs);
    setActiveAlbumTitle(title);
    setLightboxIndex(index % Math.max(1, finalImgs.length));
  };

  // Open Lightbox for Album Session
  const openAlbumLightbox = (album: GalleryAlbum, initialIdx: number) => {
    const raw = album.images && album.images.length > 0 ? album.images : [album.coverImage];
    const unique = Array.from(new Set(raw.filter(Boolean)));
    const validImages = unique.length > 0 ? unique : [album.coverImage];
    setActiveAlbumImages(validImages);
    setActiveAlbumTitle(album.title || title);
    setLightboxIndex(initialIdx % validImages.length);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const goNext = () => {
    const idx = lightboxIndexRef.current;
    const imgs = activeAlbumImagesRef.current;
    if (idx === null || imgs.length === 0) return;
    setLightboxIndex((idx + 1) % imgs.length);
  };

  const goPrev = () => {
    const idx = lightboxIndexRef.current;
    const imgs = activeAlbumImagesRef.current;
    if (idx === null || imgs.length === 0) return;
    setLightboxIndex((idx - 1 + imgs.length) % imgs.length);
  };

  // Keyboard navigation & ESC listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndexRef.current === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Touch Swipe controls for mobile
  useEffect(() => {
    if (lightboxIndex === null) return;

    let touchStartX: number | null = null;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartX === null) return;
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchEndX - touchStartX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) goPrev(); else goNext();
      }
      touchStartX = null;
    };

    const lightboxEl = document.querySelector(".lightbox-container");
    if (lightboxEl) {
      lightboxEl.addEventListener("touchstart", handleTouchStart as any, { passive: true });
      lightboxEl.addEventListener("touchend", handleTouchEnd as any, { passive: true });
    }

    return () => {
      if (lightboxEl) {
        lightboxEl.removeEventListener("touchstart", handleTouchStart as any);
        lightboxEl.removeEventListener("touchend", handleTouchEnd as any);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxIndex !== null]);

  const pad = (n: number) => String(n).padStart(2, "0");

  const lbSrc = lightboxIndex !== null && activeAlbumImages.length > 0
    ? activeAlbumImages[lightboxIndex % activeAlbumImages.length]
    : undefined;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--accent)] selection:text-black font-sans transition-colors duration-500">
      <Navbar />

      <main className="pt-20 md:pt-24 pb-14 px-4 md:px-12 max-w-7xl mx-auto flex flex-col gap-4 md:gap-8">
        
        {/* Back Link */}
        <Link
          href="/#portfolio"
          className="flex items-center gap-2 text-[11px] md:text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-[var(--accent)] transition-colors w-fit select-none"
        >
          <ArrowLeft size={14} /> Back To Portfolio
        </Link>

        {/* Category Header */}
        <div className="flex flex-col gap-2 md:gap-3 max-w-2xl">
          <span className="text-[10px] md:text-xs font-semibold tracking-[0.25em] text-[var(--accent)] uppercase font-mono flex items-center gap-1.5">
            <Layers size={13} /> Interactive Shoot Albums
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight font-display text-[var(--foreground)] leading-tight">
            {title}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-xs md:text-base leading-relaxed font-light">
            {description}
          </p>
        </div>

        {/* Sub-Navigation */}
        {subCategories && subCategories.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border border-[var(--card-border)] rounded-2xl p-1 bg-[var(--card-bg)] w-fit mb-2">
            {subCategories.map((sub) => (
              <button
                key={sub.key}
                onClick={() => {
                  setActiveSub(sub.key);
                  setLightboxIndex(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 select-none ${
                  activeSub === sub.key
                    ? "bg-[var(--accent)] text-black font-extrabold shadow-md"
                    : "text-gray-400 hover:text-[var(--foreground)]"
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}

        {/* RENDER ALBUM CARDS IF ALBUMS EXIST (2-COLUMN GRID ON MOBILE) */}
        {displayAlbums && displayAlbums.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6 w-full">
            {displayAlbums.map((album, idx) => (
              <ShootAlbumCard
                key={album.id}
                album={album}
                albumIdx={idx}
                openAlbumLightbox={openAlbumLightbox}
              />
            ))}
          </div>
        ) : (
          /* FALLBACK TO DIRECT IMAGES GRID IF NO ALBUMS */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6 w-full">
            {displayImages.map((url, idx) => (
              <GalleryImageCard
                key={idx}
                idx={idx}
                url={url}
                title={title}
                openLightbox={openLightbox}
                pad={pad}
              />
            ))}
          </div>
        )}

        {displayAlbums.length === 0 && displayImages.length === 0 && (
          <div className="text-center py-24 flex flex-col items-center gap-4 border border-dashed border-[var(--card-border)] rounded-3xl bg-[var(--card-bg)]">
            <p className="text-sm font-mono text-gray-500">No images or albums loaded in this category yet.</p>
          </div>
        )}
      </main>

      {/* ─── FULL-SCREEN LIGHTBOX ─── */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[999999] bg-black/95 backdrop-blur-md flex items-center justify-center select-none p-2 sm:p-6"
          onClick={closeLightbox}
        >
          {/* Top Header Badge & Close Button */}
          <div className="fixed top-4 left-4 right-4 flex items-center justify-between z-[1000005] pointer-events-none">
            <span className="px-3.5 py-1.5 bg-black/80 border border-white/20 rounded-full text-xs font-mono font-bold text-white backdrop-blur-md shadow-lg pointer-events-auto">
              {lightboxIndex + 1} / {activeAlbumImages.length}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
              className="w-10 h-10 rounded-full bg-black/80 border border-white/20 text-white hover:bg-[var(--accent)] hover:text-black transition-all duration-300 flex items-center justify-center pointer-events-auto shadow-lg active:scale-90 cursor-pointer"
              aria-label="Close Lightbox"
            >
              <X size={20} />
            </button>
          </div>

          {/* CENTER IMAGE WRAPPER WITH EMBEDDED PHONE NAV ARROWS AT MIDDLE HEIGHT RIGHT & LEFT SIDES */}
          <div 
            className="relative inline-flex items-center justify-center max-w-[95vw] max-h-[86vh] pointer-events-auto z-[1000000]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* PREVIOUS ARROW (<) — AT MIDDLE HEIGHT OF IMAGE WITH LITTLE SPACE */}
            {activeAlbumImages.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute -left-2 sm:-left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-13 sm:h-13 rounded-full bg-black/80 border border-[var(--accent)]/70 text-[var(--accent)] flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.9)] backdrop-blur-md hover:bg-[var(--accent)] hover:text-black active:scale-90 transition-all duration-300 z-30 cursor-pointer"
                aria-label="Previous Image"
              >
                <ChevronLeft size={24} strokeWidth={2.5} className="sm:w-7 sm:h-7" />
              </button>
            )}

            {/* MAIN CENTERED IMAGE */}
            <img
              ref={lbImgRef}
              src={lbSrc}
              alt={activeAlbumTitle || title}
              className="max-w-[84vw] sm:max-w-[90vw] max-h-[86vh] w-auto h-auto object-contain rounded-xl shadow-2xl transition-all duration-300 block"
              style={{ imageOrientation: "from-image" }}
              draggable={false}
              onClick={closeLightbox}
            />

            {/* NEXT ARROW (>) — AT MIDDLE HEIGHT OF IMAGE WITH LITTLE SPACE */}
            {activeAlbumImages.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute -right-2 sm:-right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-13 sm:h-13 rounded-full bg-black/80 border border-[var(--accent)]/70 text-[var(--accent)] flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.9)] backdrop-blur-md hover:bg-[var(--accent)] hover:text-black active:scale-90 transition-all duration-300 z-30 cursor-pointer"
                aria-label="Next Image"
              >
                <ChevronRight size={24} strokeWidth={2.5} className="sm:w-7 sm:h-7" />
              </button>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
