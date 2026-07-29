"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCw, RotateCcw, RefreshCw, CheckCircle, Image as ImageIcon, Search, Filter } from "lucide-react";

interface ImageMeta {
  url: string;
  filename: string;
  category: string;
  width: number;
  height: number;
  aspectRatio: string;
  isLandscape: boolean;
}

export default function FixImagesPage() {
  const [images, setImages] = useState<ImageMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filterType, setFilterType] = useState<"all" | "landscape" | "portrait">("all");
  const [search, setSearch] = useState("");
  const [rotatingUrl, setRotatingUrl] = useState<string | null>(null);
  const [cacheBuster, setCacheBuster] = useState<Record<string, number>>({});
  const [message, setMessage] = useState<string | null>(null);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/rotate-image");
      const data = await res.json();
      if (data.success) {
        setImages(data.images);
      }
    } catch (err) {
      console.error("Failed to fetch gallery images", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleRotate = async (url: string, angle: number) => {
    setRotatingUrl(url);
    try {
      const res = await fetch("/api/admin/rotate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath: url, angle }),
      });
      const data = await res.json();
      if (data.success) {
        // Update local state
        setImages((prev) =>
          prev.map((img) => {
            if (img.url === url) {
              return {
                ...img,
                width: data.width,
                height: data.height,
                isLandscape: data.width > data.height,
                aspectRatio: (data.width / data.height).toFixed(2),
              };
            }
            return img;
          })
        );
        // Force refresh image preview using timestamp
        setCacheBuster((prev) => ({ ...prev, [url]: Date.now() }));
        setMessage(`Rotated ${imgName(url)} by ${angle}°`);
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      console.error("Error rotating image", err);
    } finally {
      setRotatingUrl(null);
    }
  };

  const imgName = (url: string) => url.split("/").pop() || url;

  const categories = Array.from(new Set(images.map((i) => i.category))).sort();

  const filteredImages = images.filter((img) => {
    if (selectedCategory !== "all" && img.category !== selectedCategory) return false;
    if (filterType === "landscape" && !img.isLandscape) return false;
    if (filterType === "portrait" && img.isLandscape) return false;
    if (search && !img.url.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0a0c10] text-white font-sans p-4 md:p-8">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto flex flex-col gap-4 mb-8">
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-gray-400 hover:text-blue-400 transition-colors"
          >
            <ArrowLeft size={14} /> Back To Dashboard
          </Link>
          <button
            onClick={fetchImages}
            disabled={loading}
            className="flex items-center gap-2 bg-[#1a1e29] border border-[#2e364a] hover:bg-[#252b3b] text-xs font-mono px-3.5 py-2 rounded-xl text-gray-300 transition-all cursor-pointer"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh Library
          </button>
        </div>

        <div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight font-display text-white flex items-center gap-3">
            <ImageIcon className="text-blue-500" size={28} /> Visual Image Orientation Fixer
          </h1>
          <p className="text-gray-400 text-xs md:text-sm mt-1">
            Visually inspect all photography assets. Rotate any sideways or upside-down photo with 1-click. Changes save permanently to disk.
          </p>
        </div>

        {/* Status Toast */}
        {message && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-mono flex items-center gap-2 animate-fade-in shadow-lg">
            <CheckCircle size={15} /> {message}
          </div>
        )}

        {/* Controls Bar */}
        <div className="bg-[#12151e] border border-[#222838] p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center shadow-xl">
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase whitespace-nowrap transition-all ${
                selectedCategory === "all"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-[#1c2230] text-gray-400 hover:text-white"
              }`}
            >
              All ({images.length})
            </button>
            {categories.map((cat) => {
              const count = images.filter((i) => i.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-[#1c2230] text-gray-400 hover:text-white"
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          {/* Search & Orientation Filter */}
          <div className="flex gap-2 items-center">
            <div className="relative flex-1 min-w-[180px]">
              <Search size={13} className="absolute left-3 top-3 text-gray-500" />
              <input
                type="text"
                placeholder="Search file..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#181c27] border border-[#2b3347] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="bg-[#181c27] border border-[#2b3347] rounded-xl px-3 py-1.5 text-xs text-gray-300 focus:outline-none"
            >
              <option value="all">All Orientations</option>
              <option value="landscape">Landscape (W &gt; H)</option>
              <option value="portrait">Portrait (H ≥ W)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Images */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3 border border-dashed border-[#222838] rounded-3xl bg-[#12151e]">
            <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            <p className="text-xs font-mono text-gray-400">Loading gallery images...</p>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center gap-2 border border-dashed border-[#222838] rounded-3xl bg-[#12151e]">
            <p className="text-sm font-mono text-gray-400">No images match your filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredImages.map((img) => {
              const isRotating = rotatingUrl === img.url;
              const timestamp = cacheBuster[img.url] || "";
              const srcUrl = timestamp ? `${img.url}?t=${timestamp}` : img.url;

              return (
                <div
                  key={img.url}
                  className="bg-[#12151e] border border-[#222838] rounded-2xl overflow-hidden shadow-lg flex flex-col hover:border-blue-500/50 transition-all group"
                >
                  {/* Image Container */}
                  <div className="relative aspect-[4/5] bg-black/50 overflow-hidden flex items-center justify-center p-2">
                    <img
                      src={srcUrl}
                      alt={img.filename}
                      className="max-w-full max-h-full object-contain rounded-lg transition-transform duration-300"
                    />

                    {/* Dimension Badge */}
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-black/80 backdrop-blur-md rounded-full text-[10px] font-mono font-bold text-white border border-white/10 flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${img.isLandscape ? "bg-amber-400" : "bg-emerald-400"}`} />
                      {img.width} × {img.height} ({img.isLandscape ? "Landscape" : "Portrait"})
                    </div>

                    {/* Category Tag */}
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-blue-950/80 border border-blue-500/30 rounded-md text-[9px] font-mono uppercase text-blue-300">
                      {img.category}
                    </div>

                    {isRotating && (
                      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-20">
                        <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Card Info & Controls */}
                  <div className="p-3 flex flex-col gap-2.5 bg-[#161a26] border-t border-[#222838]">
                    <span className="text-xs font-mono font-semibold text-gray-200 truncate" title={img.filename}>
                      {img.filename}
                    </span>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => handleRotate(img.url, 90)}
                        disabled={isRotating}
                        className="flex items-center justify-center gap-1 bg-[#202738] hover:bg-blue-600 hover:text-white text-gray-300 py-1.5 rounded-xl text-[10px] font-mono font-bold transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                        title="Rotate 90° Clockwise"
                      >
                        <RotateCw size={11} /> 90° CW
                      </button>
                      <button
                        onClick={() => handleRotate(img.url, 270)}
                        disabled={isRotating}
                        className="flex items-center justify-center gap-1 bg-[#202738] hover:bg-blue-600 hover:text-white text-gray-300 py-1.5 rounded-xl text-[10px] font-mono font-bold transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                        title="Rotate 90° Counter-Clockwise"
                      >
                        <RotateCcw size={11} /> 90° CCW
                      </button>
                      <button
                        onClick={() => handleRotate(img.url, 180)}
                        disabled={isRotating}
                        className="flex items-center justify-center gap-1 bg-[#202738] hover:bg-blue-600 hover:text-white text-gray-300 py-1.5 rounded-xl text-[10px] font-mono font-bold transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                        title="Rotate 180° (Upside Down)"
                      >
                        <RefreshCw size={11} /> 180°
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
