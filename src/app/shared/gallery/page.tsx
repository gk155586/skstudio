"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Download, Image as ImageIcon, Video, Eye, X, ZoomIn, ZoomOut, 
  ChevronLeft, ChevronRight, FileText, Lock, Sparkles 
} from "lucide-react";
import { useTheme } from "@/components/Providers";

// Wrap search params fetching in Suspense to prevent build errors
function SharedGalleryContent() {
  const { theme } = useTheme();
  const searchParams = useSearchParams();
  const galleryId = searchParams?.get("id") || null;
  const clientEmail = searchParams?.get("client") || null;
  const secToken = searchParams?.get("sec_token") || null;

  const [files, setFiles] = useState<any[]>([]);
  const [galleryName, setGalleryName] = useState("Photography Session");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [activeTab, setActiveTab] = useState<"photos" | "clips">("photos");

  // Helper to determine direct cloud link vs local fallback streamer link
  const getFileUrl = (file: any) => {
    if (!file) return "";
    return file.url || `/api/admin/gallery/file?name=${encodeURIComponent(file.path || "")}`;
  };

  const isVideo = (mimeType: string) => mimeType?.startsWith("video/") || false;
  const isImage = (mimeType: string) => mimeType?.startsWith("image/") || false;
  const isDoc = (mimeType: string) => mimeType?.startsWith("application/") || mimeType?.startsWith("text/") || false;

  const photos = files.filter(f => isImage(f.mimeType));
  const clips = files.filter(f => isVideo(f.mimeType));
  const activeFiles = activeTab === "photos" ? photos : clips;

  useEffect(() => {
    const id = galleryId || "";
    const email = clientEmail || "";
    const token = secToken || "";

    if (!token) {
      setError("Security token parameter is missing. Access Restrained.");
      setLoading(false);
      return;
    }

    async function fetchGallery() {
      try {
        const queryParams = new URLSearchParams();
        if (id) queryParams.append("id", id);
        if (email) queryParams.append("client", email);
        queryParams.append("sec_token", token);

        const res = await fetch(`/api/shared/gallery?${queryParams.toString()}`);
        const data = await res.json();

        if (data.success) {
          setFiles(data.files || []);
          setGalleryName(data.name || "Photography Session");
          
          // Auto-switch to clips tab if there are no photos but clips exist
          const hasPhotos = (data.files || []).some((f: any) => isImage(f.mimeType));
          const hasClips = (data.files || []).some((f: any) => isVideo(f.mimeType));
          if (!hasPhotos && hasClips) {
            setActiveTab("clips");
          }
        } else {
          setError(data.message || "Failed to load gallery portfolio files.");
        }
      } catch (err) {
        console.error("Error loading gallery:", err);
        setError("A network error occurred. Please refresh or try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchGallery();
  }, [galleryId, clientEmail, secToken]);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex === null) return;
    setZoomScale(1);
    setLightboxIndex(lightboxIndex === 0 ? activeFiles.length - 1 : lightboxIndex - 1);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex === null) return;
    setZoomScale(1);
    setLightboxIndex(lightboxIndex === activeFiles.length - 1 ? 0 : lightboxIndex + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center justify-center p-6 transition-colors duration-500">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-mono text-gray-500 tracking-wider">SECURELY LOADING PORTFOLIO FILES...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center justify-center p-6 transition-colors duration-500">
        <div className="w-full max-w-md p-8 rounded-3xl border border-red-500/20 bg-red-950/10 flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-950 flex items-center justify-center text-red-500">
            <Lock size={22} />
          </div>
          <h2 className="text-lg font-bold tracking-wider">Access Restrained</h2>
          <p className="text-xs text-gray-400 font-mono leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between transition-colors duration-500">
      
      {/* Premium Header */}
      <header className="border-b border-[var(--card-border)] bg-[var(--card-bg)]/80 backdrop-blur-md py-6 px-8 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[var(--card-bg)] flex items-center justify-center border border-[var(--accent)] shadow-md relative shrink-0">
            <span className="text-[var(--accent)] font-serif font-bold text-xs">SK</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xs font-bold uppercase tracking-widest font-mono text-[var(--foreground)]">SK Studio Pune</h1>
            <span className="text-[9px] font-mono text-[var(--accent)] uppercase">{galleryName}</span>
          </div>
        </div>
        <div className="text-right font-mono text-[10px] text-gray-500 hidden sm:block">
          <span>Client Secure Vault</span>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-6 py-10 md:py-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[var(--card-border)] pb-6 mb-8 gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono tracking-widest text-[var(--accent)] uppercase font-bold flex items-center gap-1.5"><Sparkles size={11} /> Client Delivery Vault</span>
            <h2 className="text-xl font-bold tracking-wide">{galleryName}</h2>
          </div>
          <span className="text-xs font-mono text-gray-500">{activeFiles.length} Assets Displayed</span>
        </div>

        {/* Category filtering buttons on screen */}
        {files.length > 0 && (
          <div className="flex gap-3 mb-8">
            <button
              onClick={() => {
                setActiveTab("photos");
                setLightboxIndex(null);
              }}
              className={`px-6 py-2.5 rounded-full border text-xs font-mono font-bold uppercase tracking-widest transition-all duration-300 ${
                activeTab === "photos"
                  ? "bg-[var(--accent)] text-black border-[var(--accent)] shadow-md"
                  : "bg-transparent border-[var(--card-border)] text-gray-400 hover:text-[var(--foreground)] hover:border-gray-400"
              }`}
            >
              Photos ({photos.length})
            </button>
            <button
              onClick={() => {
                setActiveTab("clips");
                setLightboxIndex(null);
              }}
              className={`px-6 py-2.5 rounded-full border text-xs font-mono font-bold uppercase tracking-widest transition-all duration-300 ${
                activeTab === "clips"
                  ? "bg-[var(--accent)] text-black border-[var(--accent)] shadow-md"
                  : "bg-transparent border-[var(--card-border)] text-gray-400 hover:text-[var(--foreground)] hover:border-gray-400"
              }`}
            >
              Videos / Clips ({clips.length})
            </button>
          </div>
        )}

        {activeFiles.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] flex items-center justify-center text-gray-500"><ImageIcon size={20} /></div>
            <p className="text-sm font-mono text-gray-500">No {activeTab === "photos" ? "photos" : "videos/clips"} committed to this gallery session yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {activeFiles.map((file, idx) => (
              <div 
                key={file.id} 
                className="group relative rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] hover:border-[var(--accent)]/45 overflow-hidden transition-all duration-300 shadow-md flex flex-col justify-between"
              >
                
                {/* Media Container preview */}
                <div className="relative aspect-square w-full bg-[var(--card-bg)]/40 overflow-hidden flex items-center justify-center">
                  {isImage(file.mimeType) && (
                    <div className="relative w-full h-full">
                      <img 
                        src={getFileUrl(file)} 
                        alt={file.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                        onClick={() => {
                          setLightboxIndex(idx);
                          setZoomScale(1);
                        }}
                      />
                    </div>
                  )}
                  {isVideo(file.mimeType) && (
                    <div className="relative w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                      <video 
                        src={getFileUrl(file)} 
                        className="w-full h-full object-cover" 
                        muted 
                        playsInline
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Video className="text-white" size={26} />
                      </div>
                    </div>
                  )}
                  {isDoc(file.mimeType) && (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4 text-center">
                      <FileText size={40} className="text-amber-500" />
                      <span className="text-[10px] font-mono text-gray-500 truncate max-w-xs">{file.name}</span>
                    </div>
                  )}

                  {/* Actions overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button 
                      onClick={() => {
                        setLightboxIndex(idx);
                        setZoomScale(1);
                      }}
                      className="p-2.5 rounded-full bg-white/10 text-white hover:bg-[var(--accent)] hover:text-black transition-all"
                      title="Preview File"
                    >
                      <Eye size={16} />
                    </button>
                    <a 
                      href={getFileUrl(file)} 
                      download={file.name}
                      className="p-2.5 rounded-full bg-white/10 text-white hover:bg-[var(--accent)] hover:text-black transition-all"
                      title="Download File"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Download size={16} />
                    </a>
                  </div>
                </div>

                {/* Footer file info */}
                <div className="p-4 border-t border-[var(--card-border)] flex flex-col gap-1">
                  <span className="text-[11px] font-mono font-medium truncate max-w-full text-gray-300">{file.name}</span>
                  <span className="text-[9px] font-mono text-gray-500">
                    {(file.sizeBytes / (1024 * 1024)).toFixed(2)} MB • {file.mimeType.split("/")[0].toUpperCase()}
                  </span>
                </div>

              </div>
            ))}
          </div>
        )}
      </main>

      {/* Lightbox / Preview Carousel Overlay */}
      {lightboxIndex !== null && activeFiles[lightboxIndex] && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-4 md:p-6" onClick={() => setLightboxIndex(null)}>
          
          {/* Lightbox Header */}
          <div className="flex justify-between items-center text-white z-10 print:hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col gap-0.5 font-mono">
              <span className="text-[10px] text-gray-500">PREVIEWING {lightboxIndex + 1} OF {activeFiles.length}</span>
              <span className="text-xs font-semibold text-gray-300">{activeFiles[lightboxIndex].name}</span>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setZoomScale(prev => Math.min(prev + 0.25, 3))}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10"
              >
                <ZoomIn size={16} />
              </button>
              <button 
                onClick={() => setZoomScale(prev => Math.max(prev - 0.25, 0.5))}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10"
              >
                <ZoomOut size={16} />
              </button>
              <a 
                href={getFileUrl(activeFiles[lightboxIndex])} 
                download={activeFiles[lightboxIndex].name}
                className="p-2 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-black"
                target="_blank"
                rel="noreferrer"
              >
                <Download size={16} />
              </a>
              <button 
                onClick={() => setLightboxIndex(null)}
                className="px-4 py-2 rounded-full bg-[#b08d4b] hover:bg-[#96753a] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg"
              >
                <X size={16} /> Close
              </button>
            </div>
          </div>

          {/* Lightbox Body Center */}
          <div className="flex-grow flex items-center justify-center relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Arrow Nav Left */}
            <button 
              onClick={handlePrevImage}
              className="absolute left-2 md:left-4 z-10 p-3 rounded-full bg-black/45 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Content view container */}
            <div 
              className="max-w-5xl max-h-[75vh] w-full h-full flex items-center justify-center transition-transform duration-200"
              style={{ transform: `scale(${zoomScale})` }}
            >
              {isImage(activeFiles[lightboxIndex].mimeType) && (
                <img 
                  src={getFileUrl(activeFiles[lightboxIndex])} 
                  alt={activeFiles[lightboxIndex].name}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                />
              )}
              {isVideo(activeFiles[lightboxIndex].mimeType) && (
                <video 
                  src={getFileUrl(activeFiles[lightboxIndex])} 
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
                  controls 
                  autoPlay
                />
              )}
              {isDoc(activeFiles[lightboxIndex].mimeType) && (
                <div className="p-8 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] text-center flex flex-col items-center gap-4">
                  <FileText size={56} className="text-amber-500" />
                  <span className="text-sm font-mono text-[var(--foreground)]">{activeFiles[lightboxIndex].name}</span>
                  <a 
                    href={getFileUrl(activeFiles[lightboxIndex])} 
                    download
                    className="px-6 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-black font-bold uppercase tracking-widest text-[10px] rounded-xl"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Download File
                  </a>
                </div>
              )}
            </div>

            {/* Arrow Nav Right */}
            <button 
              onClick={handleNextImage}
              className="absolute right-2 md:right-4 z-10 p-3 rounded-full bg-black/45 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="h-4" />
        </div>
      )}

      {/* Footer copyright */}
      <footer className="border-t border-[var(--card-border)] py-6 text-center text-[9px] font-mono text-gray-500">
        <p>© 2026 SK Studio Pune. All rights reserved. Encrypted secure workspace.</p>
      </footer>

    </div>
  );
}

export default function SharedGalleryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center justify-center">
        <p className="text-xs font-mono text-gray-500 animate-pulse">BOOTING GALLERY ENGINE...</p>
      </div>
    }>
      <SharedGalleryContent />
    </Suspense>
  );
}
