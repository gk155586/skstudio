"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Search, SlidersHorizontal, Grid, LayoutGrid, Eye, Download, X, 
  ZoomIn, ZoomOut, Check, Sparkles, Send, ShoppingBag, Info, ChevronLeft, ChevronRight
} from "lucide-react";

export default function PhotoFramesPage() {
  const [frames, setFrames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filter States
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [material, setMaterial] = useState("all");
  const [color, setColor] = useState("all");
  const [size, setSize] = useState("all");
  const [sort, setSort] = useState("newest");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPopular, setIsPopular] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Detail Modal & Enquiry Form States
  const [selectedFrame, setSelectedFrame] = useState<any | null>(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [showEnquiry, setShowEnquiry] = useState(false);
  
  // Enquiry fields
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [details, setDetails] = useState("");
  const [submittingEnquiry, setSubmittingEnquiry] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);

  const categories = [
    "all", "Wedding Frames", "Pre-Wedding Frames", "Baby Frames", "Family Frames",
    "Couple Frames", "Birthday Frames", "Anniversary Frames", "Premium Luxury Frames",
    "Wooden Frames", "Acrylic Frames", "Metal Frames", "Canvas Frames",
    "Glass Frames", "Classic Frames", "Modern Frames", "Vintage Frames",
    "Collage Frames", "Custom Frames", "Wall Frames", "Table Frames"
  ];

  const materials = ["all", "Wooden", "Acrylic", "Metal", "Canvas", "Glass", "Composite"];
  const colors = ["all", "Gold", "Silver", "Black", "Oak Wood", "Dark Walnut", "Rose Gold", "White", "Platinum"];
  const sizes = ["all", "8\"x10\"", "12\"x18\"", "16\"x24\"", "20\"x30\"", "24\"x36\""];

  useEffect(() => {
    fetchFrames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, category, material, color, size, sort, isFeatured, isPopular, isBestSeller, isNew]);

  // Debounce search query to prevent excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchFrames();
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const fetchFrames = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        search,
        category,
        material,
        color,
        size,
        sort,
        isFeatured: isFeatured ? "true" : "false",
        isPopular: isPopular ? "true" : "false",
        isBestSeller: isBestSeller ? "true" : "false",
        isNew: isNew ? "true" : "false"
      });

      const res = await fetch(`/api/admin/frames?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setFrames(data.frames || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || 0);
      }
    } catch (err) {
      console.error("Failed to load frames catalog:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFrame || !customerName || !customerEmail || !customerPhone) return;
    setSubmittingEnquiry(true);

    try {
      const res = await fetch("/api/admin/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frameId: selectedFrame.id,
          frameCode: selectedFrame.code,
          frameName: selectedFrame.name,
          customerName,
          customerEmail,
          customerPhone,
          details
        })
      });

      const data = await res.json();
      if (data.success) {
        setEnquirySuccess(true);
        setCustomerName("");
        setCustomerEmail("");
        setCustomerPhone("");
        setDetails("");
        setTimeout(() => {
          setEnquirySuccess(false);
          setShowEnquiry(false);
        }, 3000);
      } else {
        alert("Submission failed: " + data.message);
      }
    } catch (err) {
      console.error("Enquiry submission error:", err);
      alert("A network error occurred. Please try again.");
    } finally {
      setSubmittingEnquiry(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between transition-colors duration-500">
      <Navbar />

      {/* Hero Banner Header */}
      <div className="relative py-10 md:py-20 px-4 md:px-6 text-center overflow-hidden border-b border-[var(--card-border)] bg-[var(--card-bg)] transition-colors duration-500">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#d1b06c]/5 blur-[120px] pointer-events-none" />
        <div className="max-w-3xl mx-auto flex flex-col gap-2.5 md:gap-4 relative z-10">
          <span className="text-[9px] md:text-[10px] tracking-[0.3em] font-mono text-[#d1b06c] uppercase font-bold flex items-center justify-center gap-1.5">
            <Sparkles size={11} /> Museum Quality Presentations
          </span>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-wide font-display text-[var(--foreground)]">
            Signature Photo Frames
          </h1>
          <p className="text-[11px] md:text-xs text-gray-500 dark:text-gray-400 font-sans max-w-xl mx-auto leading-relaxed">
            Enhance your legacy portraits with our custom handcrafted frame collection. Available in wooden, acrylic, and premium luxury ornate designs.
          </p>
        </div>
      </div>

      {/* Main Catalog Workspace */}
      <div className="max-w-7xl w-full mx-auto px-4 md:px-6 py-6 md:py-12 flex-grow flex flex-col lg:flex-row gap-6 md:gap-8">
        
        {/* COMPACT COLLAPSIBLE FILTER BAR ON MOBILE (Saves Space on Mobile Only) */}
        <div className="flex lg:hidden flex-col w-full">
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground)] text-xs font-bold font-mono uppercase tracking-wider shadow-sm active:scale-[0.99] transition-all"
          >
            <span className="flex items-center gap-2 text-[#d1b06c]">
              <SlidersHorizontal size={14} /> Filter Designs & Search
              {(category !== "all" || material !== "all" || color !== "all" || size !== "all" || search) && (
                <span className="w-2 h-2 rounded-full bg-[#d1b06c]" />
              )}
            </span>
            <span className="text-[10px] text-gray-500 font-mono">
              {mobileFiltersOpen ? "Hide ▲" : "Show ▼"}
            </span>
          </button>

          {mobileFiltersOpen && (
            <div className="mt-2.5 p-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] flex flex-col gap-3.5 shadow-xl animate-fade-in">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-mono text-gray-500 uppercase">Search Catalog</label>
                <div className="flex items-center gap-2 px-3 py-2 bg-[var(--background)] rounded-xl border border-[var(--card-border)]">
                  <Search size={14} className="text-gray-500" />
                  <input 
                    type="text"
                    placeholder="Code, name, style..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-transparent border-none text-xs focus:outline-none w-full text-[var(--foreground)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-mono text-gray-500 uppercase">Category</label>
                  <select
                    value={category}
                    onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                    className="px-2.5 py-1.5 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-[11px] focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-mono text-gray-500 uppercase">Material</label>
                  <select
                    value={material}
                    onChange={(e) => { setMaterial(e.target.value); setPage(1); }}
                    className="px-2.5 py-1.5 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-[11px] focus:outline-none"
                  >
                    {materials.map(m => (
                      <option key={m} value={m}>{m === "all" ? "All Materials" : m}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-mono text-gray-500 uppercase">Color</label>
                  <select
                    value={color}
                    onChange={(e) => { setColor(e.target.value); setPage(1); }}
                    className="px-2.5 py-1.5 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-[11px] focus:outline-none"
                  >
                    {colors.map(c => (
                      <option key={c} value={c}>{c === "all" ? "All Colors" : c}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-mono text-gray-500 uppercase">Size</label>
                  <select
                    value={size}
                    onChange={(e) => { setSize(e.target.value); setPage(1); }}
                    className="px-2.5 py-1.5 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-[11px] focus:outline-none"
                  >
                    {sizes.map(s => (
                      <option key={s} value={s}>{s === "all" ? "All Sizes" : s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-[var(--card-border)]">
                <button 
                  onClick={() => {
                    setSearch(""); setCategory("all"); setMaterial("all");
                    setColor("all"); setSize("all"); setSort("newest");
                    setIsFeatured(false); setIsPopular(false); setIsBestSeller(false); setIsNew(false);
                  }}
                  className="text-[10px] text-[#d1b06c] hover:underline font-mono"
                >
                  Reset Filters
                </button>
                <button 
                  onClick={() => setMobileFiltersOpen(false)}
                  className="px-4 py-1.5 rounded-xl bg-[#d1b06c] text-black text-[10px] font-extrabold uppercase font-mono shadow"
                >
                  Apply & Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* FULL DESKTOP FILTERS SIDEBAR (100% Untouched for Desktop) */}
        <aside className="hidden lg:flex w-72 shrink-0 flex-col gap-6">
          <div className="p-6 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] flex flex-col gap-5 transition-colors duration-500">
            <div className="flex justify-between items-center border-b border-[var(--card-border)] pb-3">
              <span className="text-xs font-bold uppercase tracking-wider font-mono text-[var(--foreground)] flex items-center gap-1.5">
                <SlidersHorizontal size={13} /> Filter designs
              </span>
              <button 
                onClick={() => {
                  setSearch(""); setCategory("all"); setMaterial("all");
                  setColor("all"); setSize("all"); setSort("newest");
                  setIsFeatured(false); setIsPopular(false); setIsBestSeller(false); setIsNew(false);
                }}
                className="text-[10px] text-[#d1b06c] hover:underline font-mono"
              >
                Reset All
              </button>
            </div>

            {/* Search Box */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Search Catalog</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-[var(--background)] rounded-xl border border-[var(--card-border)]">
                <Search size={14} className="text-gray-500" />
                <input 
                  type="text"
                  placeholder="Code, name, style..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent border-none text-xs focus:outline-none w-full text-[var(--foreground)]"
                />
              </div>
            </div>

            {/* Category selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Occasion / Category</label>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                className="px-3 py-2 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-xs focus:outline-none focus:border-[#d1b06c]"
              >
                {categories.map(c => (
                  <option key={c} value={c} className="bg-[var(--card-bg)] text-[var(--foreground)]">{c === "all" ? "All Categories" : c}</option>
                ))}
              </select>
            </div>

            {/* Material */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Frame Material</label>
              <select
                value={material}
                onChange={(e) => { setMaterial(e.target.value); setPage(1); }}
                className="px-3 py-2 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-xs focus:outline-none focus:border-[#d1b06c]"
              >
                {materials.map(m => (
                  <option key={m} value={m} className="bg-[var(--card-bg)] text-[var(--foreground)]">{m === "all" ? "All Materials" : m}</option>
                ))}
              </select>
            </div>

            {/* Color */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Frame Color</label>
              <select
                value={color}
                onChange={(e) => { setColor(e.target.value); setPage(1); }}
                className="px-3 py-2 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-xs focus:outline-none focus:border-[#d1b06c]"
              >
                {colors.map(c => (
                  <option key={c} value={c} className="bg-[var(--card-bg)] text-[var(--foreground)]">{c === "all" ? "All Colors" : c}</option>
                ))}
              </select>
            </div>

            {/* Standard Size */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Standard Size</label>
              <select
                value={size}
                onChange={(e) => { setSize(e.target.value); setPage(1); }}
                className="px-3 py-2 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-xs focus:outline-none focus:border-[#d1b06c]"
              >
                {sizes.map(s => (
                  <option key={s} value={s} className="bg-[var(--card-bg)] text-[var(--foreground)]">{s === "all" ? "All Sizes" : s}</option>
                ))}
              </select>
            </div>

            {/* sorting selection */}
            <div className="flex flex-col gap-1.5 border-t border-[var(--card-border)] pt-4">
              <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Sort Results</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-xs focus:outline-none focus:border-[#d1b06c]"
              >
                <option value="newest" className="bg-[var(--card-bg)] text-[var(--foreground)]">New Arrivals</option>
                <option value="price_asc" className="bg-[var(--card-bg)] text-[var(--foreground)]">Price: Low to High</option>
                <option value="price_desc" className="bg-[var(--card-bg)] text-[var(--foreground)]">Price: High to Low</option>
                <option value="name" className="bg-[var(--card-bg)] text-[var(--foreground)]">Name: A to Z</option>
              </select>
            </div>

            {/* Badges Swapped Checkboxes */}
            <div className="border-t border-[var(--card-border)] pt-4 flex flex-col gap-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded border-[var(--card-border)] bg-[var(--background)] text-[var(--accent)] focus:ring-0" 
                />
                <span>Featured Frames</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={isPopular}
                  onChange={(e) => setIsPopular(e.target.checked)}
                  className="rounded border-[var(--card-border)] bg-[var(--background)] text-[var(--accent)] focus:ring-0" 
                />
                <span>Popular Choices</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={isBestSeller}
                  onChange={(e) => setIsBestSeller(e.target.checked)}
                  className="rounded border-[var(--card-border)] bg-[var(--background)] text-[var(--accent)] focus:ring-0" 
                />
                <span>Best Sellers</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Right side Grid View */}
        <section className="flex-grow flex flex-col justify-between gap-8">
          <div className="flex justify-between items-center text-xs text-gray-500 font-mono">
            <span>Showing {frames.length} of {totalCount} frame designs</span>
          </div>

          {loading ? (
            <div className="flex-grow py-32 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-[#d1b06c] border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px] font-mono text-gray-500">Querying frame designs catalog...</span>
            </div>
          ) : frames.length === 0 ? (
            <div className="flex-grow py-32 text-center flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full border border-[var(--card-border)] flex items-center justify-center text-gray-500"><Grid size={18}/></div>
              <p className="text-sm font-mono text-gray-500">No frames match your selected filters. Try broadening the search criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
              {frames.map((frame) => (
                <div 
                  key={frame.id}
                  className="group relative rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] hover:border-[#d1b06c]/40 overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-md"
                >
                  <div className="relative aspect-[4/5] bg-black overflow-hidden flex items-center justify-center cursor-pointer" onClick={() => { setSelectedFrame(frame); setZoomScale(1); }}>
                    <img 
                      src={frame.images?.[0] || "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=400"} 
                      alt={frame.name}
                      loading="eager"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Badges Overlay */}
                    <div className="absolute top-2 left-2 md:top-3 md:left-3 flex flex-col gap-1">
                      {frame.isFeatured && <span className="bg-[#d1b06c] text-black text-[7px] md:text-[8px] font-mono font-extrabold uppercase px-1.5 md:px-2 py-0.5 rounded shadow">Featured</span>}
                      {frame.isBestSeller && <span className="bg-emerald-600 text-white text-[7px] md:text-[8px] font-mono font-extrabold uppercase px-1.5 md:px-2 py-0.5 rounded shadow">Best Seller</span>}
                      {frame.isNew && <span className="bg-sky-600 text-white text-[7px] md:text-[8px] font-mono font-extrabold uppercase px-1.5 md:px-2 py-0.5 rounded shadow">New</span>}
                    </div>

                    {/* Desktop Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedFrame(frame); setZoomScale(1); }}
                        className="p-3 rounded-full bg-white/10 hover:bg-[#d1b06c] hover:text-black text-white transition-all shadow"
                        title="View Full Specs"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Frame details row */}
                  <div className="p-3 md:p-5 border-t border-[var(--card-border)] flex flex-col gap-1">
                    <div className="flex justify-between items-start gap-1">
                      <span className="text-[9px] md:text-[10px] font-mono text-gray-500 truncate">{frame.code}</span>
                      <span className="text-[9px] md:text-[10px] font-mono text-[#d1b06c] uppercase font-semibold shrink-0">{frame.material}</span>
                    </div>
                    <h3 className="text-xs md:text-sm font-bold font-display truncate max-w-full text-[var(--foreground)] leading-tight">{frame.name}</h3>
                    <div className="flex justify-between items-center mt-1.5 pt-1.5 border-t border-[var(--card-border)]/50">
                      <span className="text-[9px] md:text-xs text-gray-400 font-mono">{frame.size}</span>
                      <span className="text-xs md:text-sm font-extrabold text-[var(--foreground)] font-mono">₹{(frame.price || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6 border-t border-[var(--card-border)] pt-6">
              <button
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="p-2 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[#d1b06c] text-[var(--foreground)] disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-mono text-gray-400">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="p-2 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[#d1b06c] text-[var(--foreground)] disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Frame Detail Specifications Modal */}
      {selectedFrame && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 md:p-6 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-5xl rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 md:p-10 relative flex flex-col md:flex-row gap-8 shadow-2xl overflow-y-auto max-h-[90vh] text-[var(--foreground)]">
            
            {/* Close button */}
            <button 
              onClick={() => { setSelectedFrame(null); setShowEnquiry(false); }}
              className="absolute top-4 right-4 text-gray-500 hover:text-[var(--accent)] transition-colors"
            >
              <X size={18} />
            </button>

            {/* Left side preview & zoom tools */}
            <div className="w-full md:w-1/2 flex flex-col gap-4">
              <div className="relative aspect-[4/5] bg-black rounded-2xl overflow-hidden flex items-center justify-center border border-[var(--card-border)]">
                <img 
                  src={selectedFrame.images?.[0] || "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600"} 
                  alt={selectedFrame.name}
                  className="max-w-full max-h-full object-contain transition-transform duration-200"
                  style={{ transform: `scale(${zoomScale})` }}
                />

                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button onClick={() => setZoomScale(prev => Math.min(prev + 0.25, 3.0))} className="p-2 rounded-full bg-black/60 text-white border border-white/10 hover:bg-black"><ZoomIn size={14}/></button>
                  <button onClick={() => setZoomScale(prev => Math.max(prev - 0.25, 1.0))} className="p-2 rounded-full bg-black/60 text-white border border-white/10 hover:bg-black"><ZoomOut size={14}/></button>
                </div>
              </div>
            </div>

            {/* Right side specifications & enquiry form toggle */}
            <div className="w-full md:w-1/2 flex flex-col justify-between gap-6">
              
              {!showEnquiry ? (
                /* Specifications View */
                <div className="flex flex-col gap-5 text-xs font-mono">
                  <div>
                    <span className="text-[#d1b06c] font-bold text-[9px] tracking-wider uppercase">{selectedFrame.category}</span>
                    <h2 className="text-xl font-bold tracking-wide mt-1 text-[var(--foreground)]">{selectedFrame.name}</h2>
                    <p className="text-[10px] text-gray-500 mt-0.5">Frame Code: {selectedFrame.code}</p>
                  </div>

                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{selectedFrame.description}</p>

                  <div className="grid grid-cols-2 gap-4 border-t border-b border-[var(--card-border)] py-4 my-2">
                    <div><span className="text-gray-500">STYLE:</span><p className="text-[var(--foreground)] font-bold">{selectedFrame.style}</p></div>
                    <div><span className="text-gray-500">MATERIAL:</span><p className="text-[var(--foreground)] font-bold">{selectedFrame.material}</p></div>
                    <div><span className="text-gray-500">COLOR:</span><p className="text-[var(--foreground)] font-bold">{selectedFrame.color}</p></div>
                    <div><span className="text-gray-500">FINISH:</span><p className="text-[var(--foreground)] font-bold">{selectedFrame.finish}</p></div>
                    <div><span className="text-gray-500">SIZE:</span><p className="text-[var(--foreground)] font-bold">{selectedFrame.size}</p></div>
                    <div><span className="text-gray-500">THICKNESS:</span><p className="text-[var(--foreground)] font-bold">{selectedFrame.thickness}</p></div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-gray-500">RECOMMENDED PRINT SIZES:</span>
                    <div className="flex gap-2">
                      {selectedFrame.recommendedSizes?.map((sz: string) => (
                        <span key={sz} className="px-2 py-1 bg-[var(--background)] border border-[var(--card-border)] text-[var(--foreground)] rounded text-[10px]">{sz}</span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <div className="flex flex-col">
                      <span className="text-gray-500">ESTIMATED PRICE:</span>
                      <span className="text-lg font-bold text-[#d1b06c]">₹{(selectedFrame.price || 0).toLocaleString()}</span>
                    </div>
                    <button
                      onClick={() => setShowEnquiry(true)}
                      className="px-6 py-3 bg-[#d1b06c] hover:bg-[#c39e58] text-black font-bold uppercase rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <ShoppingBag size={14} /> Request This Frame
                    </button>
                  </div>
                </div>
              ) : (
                /* Enquiry Form View */
                <form onSubmit={handleEnquirySubmit} className="flex flex-col gap-4 font-mono text-xs">
                  <div className="border-b border-[var(--card-border)] pb-3 flex justify-between items-center">
                    <span className="text-[var(--foreground)] font-bold">Request Enquiry for: <span className="text-[#d1b06c]">{selectedFrame.code}</span></span>
                    <button type="button" onClick={() => setShowEnquiry(false)} className="text-[10px] text-gray-500 hover:underline">Cancel</button>
                  </div>

                  {enquirySuccess ? (
                    <div className="py-12 flex flex-col items-center gap-3 text-center">
                      <div className="w-10 h-10 rounded-full bg-emerald-600/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 animate-pulse"><Check size={18}/></div>
                      <h4 className="font-bold text-[var(--foreground)]">Enquiry Logged</h4>
                      <p className="text-[10px] text-gray-500">Your request was saved. The studio admin will notify you shortly.</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col gap-1.5">
                        <label>Your Full Name:</label>
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="e.g. John Doe"
                          className="px-3 py-2 bg-[var(--background)] border border-[var(--card-border)] text-[var(--foreground)] rounded-xl focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label>Email Address:</label>
                          <input
                            type="email"
                            required
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            placeholder="john@example.com"
                            className="px-3 py-2 bg-[var(--background)] border border-[var(--card-border)] text-[var(--foreground)] rounded-xl focus:outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label>Phone Number:</label>
                          <input
                            type="tel"
                            required
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="+91 98765 43210"
                            className="px-3 py-2 bg-[var(--background)] border border-[var(--card-border)] text-[var(--foreground)] rounded-xl focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label>Custom Details / Comments:</label>
                        <textarea
                          rows={3}
                          value={details}
                          onChange={(e) => setDetails(e.target.value)}
                          placeholder="Specify frame customization requirements, size changes, etc."
                          className="px-3 py-2 bg-[var(--background)] border border-[var(--card-border)] text-[var(--foreground)] rounded-xl focus:outline-none resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submittingEnquiry}
                        className="w-full mt-2 py-3.5 bg-[#d1b06c] hover:bg-[#c39e58] text-black font-bold uppercase rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        <Send size={12} /> {submittingEnquiry ? "Submitting Request..." : "Submit Enquiry"}
                      </button>
                    </>
                  )}
                </form>
              )}

            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
