"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import PageLoader from "@/components/PageLoader";
import FloatingChatWidget from "@/components/FloatingChatWidget";
import { 
  ArrowUp, ArrowDown, Trash2, Copy, Plus, X, FolderOpen,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  Upload, Search, Palette, Check, RefreshCw
} from "lucide-react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  playLoader: () => void;
}

interface ContentContextType {
  content: any;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) throw new Error("useContent must be used within a ContentProvider");
  return context;
}

const GOOGLE_FONTS = [
  "Inter", "Cormorant Garamond", "Montserrat", "Playfair Display",
  "Outfit", "Cinzel", "Prata", "Roboto", "Lora", "Oswald",
  "Bodoni Moda", "Quicksand", "Syne", "Cabinet Grotesk"
];

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<Theme>("light");
  const [content, setContent] = useState<any>(null);
  const [contentLoading, setContentLoading] = useState(true);
  const [loaderActive, setLoaderActive] = useState(true);

  // Visual editor inline state
  const [isVisualEditor, setIsVisualEditor] = useState(false);
  const [selectedEl, setSelectedEl] = useState<any | null>(null);
  const [mediaImages, setMediaImages] = useState<string[]>([]);
  const [showMediaList, setShowMediaList] = useState(false);
  const [mediaSearch, setMediaSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [curtainState, setCurtainState] = useState<{ active: boolean; closing: boolean; targetTheme: Theme } | null>(null);

  const fetchContent = async () => {
    try {
      const res = await fetch("/api/public/content");
      const data = await res.json();
      if (data.success) {
        setContent(data.content);
      }
    } catch (err) {
      console.error("Failed to fetch public content:", err);
    } finally {
      setContentLoading(false);
    }
  };

  // Fetch pre-available images inside iframe on load
  const loadMediaLibrary = async () => {
    try {
      const res = await fetch("/api/admin/images");
      const data = await res.json();
      if (data.success && data.images) {
        setMediaImages(data.images);
      }
    } catch (err) {
      console.error("Failed to fetch media inside iframe", err);
    }
  };

  useEffect(() => {
    fetchContent();

    // Silent background auth session maintainer (prevents session expiration mid-usage)
    const silentRefresh = () => {
      fetch("/api/auth/refresh", { method: "POST" }).catch(() => {});
    };
    silentRefresh();
    const refreshTimer = setInterval(silentRefresh, 15 * 60 * 1000); // 15 mins
    window.addEventListener("focus", silentRefresh);

    const eventSource = new EventSource("/api/public/events");
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.action === "save_content" || data.type === "data_changed") {
          fetchContent();
        }
      } catch (err) {}
    };

    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === "UPDATE_PREVIEW_CONTENT") {
        setContent(e.data.content);
      }
    };
    window.addEventListener("message", handleMessage);

    if (typeof window !== "undefined") {
      const isFrame = window.location.search.includes("visual_editor=true") || window.name === "visual-editor-preview";
      setIsVisualEditor(isFrame);
      if (isFrame) loadMediaLibrary();
    }

    const handleGlobalButtonClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("button, a.btn-primary, a.btn-secondary, a.btn, .shutter-btn, .clickable");
      if (!target) return;

      // EXCLUDE SEARCH BUTTON & SEARCH MODAL TRIGGERS
      if (
        target.classList.contains("btn-search") ||
        target.closest("[data-search-trigger]") ||
        target.getAttribute("aria-label")?.toLowerCase().includes("search") ||
        target.querySelector(".lucide-search") ||
        target.classList.contains("no-shutter") ||
        target.classList.contains("switch") ||
        target.closest(".switch")
      ) {
        return;
      }

      target.classList.add("firing");
      setTimeout(() => {
        target.classList.remove("firing");
      }, 150);
    };

    document.addEventListener("click", handleGlobalButtonClick, true);

    return () => {
      eventSource.close();
      window.removeEventListener("message", handleMessage);
      document.removeEventListener("click", handleGlobalButtonClick, true);
    };
  }, []);

  // Dynamically inject custom visual styles and Google Fonts from content state
  useEffect(() => {
    if (typeof window === "undefined" || !content) return;
    let css = "";
    const fontsToLoad = new Set<string>();

    const traverse = (obj: any, path: string) => {
      if (!obj || typeof obj !== "object") return;

      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          traverse(item, `${path}.${index}`);
        });
        return;
      }

      Object.keys(obj).forEach((key) => {
        if (key.endsWith("Style") && obj[key] && typeof obj[key] === "object") {
          const targetPath = path ? `${path}.${key.slice(0, -5)}` : key.slice(0, -5);
          const styleObj = obj[key];

          let rules = "";
          if (styleObj.fontFamily && styleObj.fontFamily !== "inherit") {
            rules += `font-family: '${styleObj.fontFamily}', sans-serif !important;\n`;
            fontsToLoad.add(styleObj.fontFamily);
          }
          if (styleObj.fontSize) {
            rules += `font-size: ${styleObj.fontSize}px !important;\n`;
          }
          if (styleObj.color) {
            rules += `color: ${styleObj.color} !important;\n`;
          }
          if (styleObj.bold !== undefined) {
            rules += `font-weight: ${styleObj.bold ? "bold" : (styleObj.fontWeight || "normal")} !important;\n`;
          } else if (styleObj.fontWeight) {
            rules += `font-weight: ${styleObj.fontWeight} !important;\n`;
          }
          if (styleObj.italic !== undefined) {
            rules += `font-style: ${styleObj.italic ? "italic" : "normal"} !important;\n`;
          }
          if (styleObj.underline !== undefined) {
            rules += `text-decoration: ${styleObj.underline ? "underline" : "none"} !important;\n`;
          }
          if (styleObj.alignment) {
            rules += `text-align: ${styleObj.alignment} !important;\n`;
          }

          if (rules) {
            css += `[data-edit-id="${targetPath}"] {\n${rules}}\n`;
          }
        } else {
          traverse(obj[key], path ? `${path}.${key}` : key);
        }
      });
    };

    traverse(content, "");

    let styleTag = document.getElementById("visual-editor-custom-styles");
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = "visual-editor-custom-styles";
      document.head.appendChild(styleTag);
    }
    styleTag.innerHTML = css;

    if (fontsToLoad.size > 0) {
      const linkId = "visual-editor-google-fonts";
      let linkTag = document.getElementById(linkId) as HTMLLinkElement;
      if (!linkTag) {
        linkTag = document.createElement("link");
        linkTag.id = linkId;
        linkTag.rel = "stylesheet";
        document.head.appendChild(linkTag);
      }
      const fontQuery = Array.from(fontsToLoad).map(f => f.replace(/\s+/g, "+")).join("|");
      linkTag.href = `https://fonts.googleapis.com/css?family=${fontQuery}:300,400,500,600,700,800&display=swap`;
    }
  }, [content]);

  // Visual Inline Editor click and hover outlines (Phase 0 Stable IDs)
  useEffect(() => {
    if (typeof window === "undefined" || !isVisualEditor || !content) return;

    // Custom CSS injection targeting data-edit-id
    const style = document.createElement("style");
    style.innerHTML = `
      [data-edit-id]:hover {
        outline: 2px dashed #3b82f6 !important;
        outline-offset: 1px !important;
        cursor: pointer !important;
        background-color: rgba(59, 130, 246, 0.06) !important;
      }
      [data-edit-id] {
        transition: outline 0.1s ease, background-color 0.1s ease !important;
      }
    `;
    document.head.appendChild(style);

    const getBgImageUrl = (el: HTMLElement): string => {
      const bgImg = window.getComputedStyle(el).backgroundImage;
      if (bgImg && bgImg !== "none" && bgImg.includes("url(")) {
        const match = bgImg.match(/url\(["']?([^"']+)["']?\)/);
        if (match) {
          let cleanUrl = match[1];
          if (cleanUrl.startsWith(window.location.origin)) {
            cleanUrl = cleanUrl.substring(window.location.origin.length);
          }
          return cleanUrl;
        }
      }
      return "";
    };

    const handleWindowClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      const editable = target.closest("[data-edit-id]") as HTMLElement;
      if (!editable) {
        if (!target.closest(".inline-editor-box") && !target.closest(".inline-media-box")) {
          setSelectedEl(null);
          setShowMediaList(false);
        }
        return;
      }
      e.preventDefault();
      e.stopPropagation();

      const path = editable.getAttribute("data-edit-id");
      if (!path) return;

      // Deterministic lookup directly from local context content state
      const val = path.split(".").reduce((o, k) => (o ? o[k] : undefined), content);

      let isImage = false;
      if (
        editable.tagName === "IMG" || 
        getBgImageUrl(editable).length > 0 || 
        path.endsWith(".image") || 
        path.endsWith(".backgroundImage") || 
        path.endsWith(".avatar")
      ) {
        isImage = true;
      }

      const rect = editable.getBoundingClientRect();
      setSelectedEl({
        path,
        value: typeof val === "string" ? val : "",
        tagName: isImage ? "IMG" : "TEXT",
        rect: {
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
          bottom: rect.bottom + window.scrollY
        }
      });
    };

    window.addEventListener("click", handleWindowClick, true);

    return () => {
      style.remove();
      window.removeEventListener("click", handleWindowClick, true);
    };
  }, [content, isVisualEditor]);

  // Handle local visual edits and post message to parent page
  const updateContentKey = (path: string, value: any) => {
    const updated = JSON.parse(JSON.stringify(content));
    const keys = path.split(".");
    let current = updated;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      const nextKey = keys[i + 1];
      if (current[key] === undefined) {
        current[key] = !isNaN(Number(nextKey)) ? [] : {};
      }
      current = current[key];
    }

    const lastKey = keys[keys.length - 1];
    if (!isNaN(Number(lastKey))) {
      current[Number(lastKey)] = value;
    } else {
      current[lastKey] = value;
    }

    setContent(updated);
    
    // Send to parent for autoSave
    if (window.parent) {
      window.parent.postMessage({ type: "AUTOSAVE_CONTENT", content: updated }, "*");
    }
  };

  // CRUD actions for list items inside visual editor
  const handleMoveUp = (path: string) => {
    const match = path.match(/^([a-zA-Z0-9.]+)\.(\d+)(?:\.|$)/);
    if (!match) return;
    const parentPath = match[1];
    const idx = parseInt(match[2]);
    if (idx === 0) return;

    const listPathKeys = parentPath.split(".");
    const updated = JSON.parse(JSON.stringify(content));
    const parent = listPathKeys.reduce((o, k) => o[k], updated);
    
    const temp = parent[idx];
    parent[idx] = parent[idx - 1];
    parent[idx - 1] = temp;

    setContent(updated);
    window.parent.postMessage({ type: "AUTOSAVE_CONTENT", content: updated }, "*");
    setSelectedEl(null);
  };

  const handleMoveDown = (path: string) => {
    const match = path.match(/^([a-zA-Z0-9.]+)\.(\d+)(?:\.|$)/);
    if (!match) return;
    const parentPath = match[1];
    const idx = parseInt(match[2]);

    const listPathKeys = parentPath.split(".");
    const updated = JSON.parse(JSON.stringify(content));
    const parent = listPathKeys.reduce((o, k) => o[k], updated);
    if (idx === parent.length - 1) return;

    const temp = parent[idx];
    parent[idx] = parent[idx + 1];
    parent[idx + 1] = temp;

    setContent(updated);
    window.parent.postMessage({ type: "AUTOSAVE_CONTENT", content: updated }, "*");
    setSelectedEl(null);
  };

  const handleDuplicate = (path: string) => {
    const match = path.match(/^([a-zA-Z0-9.]+)\.(\d+)(?:\.|$)/);
    if (!match) return;
    const parentPath = match[1];
    const idx = parseInt(match[2]);

    const listPathKeys = parentPath.split(".");
    const updated = JSON.parse(JSON.stringify(content));
    const parent = listPathKeys.reduce((o, k) => o[k], updated);
    
    const copied = JSON.parse(JSON.stringify(parent[idx]));
    if (copied.id) copied.id = `${copied.id}-copy-${Date.now()}`;
    parent.splice(idx + 1, 0, copied);

    setContent(updated);
    window.parent.postMessage({ type: "AUTOSAVE_CONTENT", content: updated }, "*");
    setSelectedEl(null);
  };

  const handleDelete = (path: string) => {
    const match = path.match(/^([a-zA-Z0-9.]+)\.(\d+)(?:\.|$)/);
    if (!match) return;
    const parentPath = match[1];
    const idx = parseInt(match[2]);

    const listPathKeys = parentPath.split(".");
    const updated = JSON.parse(JSON.stringify(content));
    const parent = listPathKeys.reduce((o, k) => o[k], updated);
    parent.splice(idx, 1);

    setContent(updated);
    window.parent.postMessage({ type: "AUTOSAVE_CONTENT", content: updated }, "*");
    setSelectedEl(null);
  };

  const handleAddNewItem = (path: string) => {
    const match = path.match(/^([a-zA-Z0-9.]+)\.(\d+)(?:\.|$)/);
    if (!match) return;
    const parentPath = match[1];

    const listPathKeys = parentPath.split(".");
    const updated = JSON.parse(JSON.stringify(content));
    const parent = listPathKeys.reduce((o, k) => o[k], updated);

    let newItem: any = {};
    if (parentPath.includes("services")) {
      newItem = {
        id: `srv-${Date.now()}`,
        title: "New Custom Service",
        description: "Bespoke photography setup details.",
        details: ["Service option 1"],
        image: "/images/frames-preview.jpg",
        slug: "custom-shoot"
      };
    } else if (parentPath.includes("categories")) {
      newItem = {
        name: "New Category Theme",
        image: "/images/frames-preview.jpg",
        description: "Shoot props category theme description",
        url: "/new-shoot"
      };
    } else {
      newItem = JSON.parse(JSON.stringify(parent[parent.length - 1] || {}));
    }

    parent.push(newItem);
    setContent(updated);
    window.parent.postMessage({ type: "AUTOSAVE_CONTENT", content: updated }, "*");
    setSelectedEl(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    const file = e.target.files[0];
    const fd = new FormData();
    fd.append("galleryId", "general");
    fd.append("files", file);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success && data.files?.[0]?.url) {
        const uploadedUrl = data.files[0].url;
        setMediaImages(prev => [uploadedUrl, ...prev]);
        updateContentKey(selectedEl.path, uploadedUrl);
        setShowMediaList(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const getStyleKey = (key: string): any => {
    if (!selectedEl) return "";
    try {
      const keys = selectedEl.path.split(".");
      // If path contains element path, e.g. 'hero.title' -> style path is 'hero.titleStyle.key'
      const stylePath = `${selectedEl.path}Style.${key}`;
      return stylePath.split(".").reduce((o, k) => o[k], content);
    } catch {
      return "";
    }
  };

  const setStyleKey = (key: string, value: any) => {
    if (!selectedEl) return;
    updateContentKey(`${selectedEl.path}Style.${key}`, value);
  };

  const applyTheme = (nextTheme: Theme) => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.remove("dark-theme", "light-theme", "dark", "light");
    document.documentElement.classList.add("light-theme", "light");
    document.documentElement.style.colorScheme = "light";
    if (typeof window !== "undefined") {
      window.localStorage.setItem("theme", "light");
    }
  };

  const toggleTheme = () => {
    // Theme toggling disabled - forced light mode
  };

  const playLoader = () => {
    setLoaderActive(true);
    setTimeout(() => {
      setLoaderActive(false);
    }, 1300);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaderActive(false);
    }, 1300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setTheme("light");
      applyTheme("light");
    }
  }, []);

  // Enforce scroll fallback inside iframe
  useEffect(() => {
    if (typeof window === "undefined" || isVisualEditor) return;

    // Skip smooth-scroll library on touch/mobile devices for instant 120Hz native touch response
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    if (isMobile) return;

    const lenis = new Lenis({
      duration: 0.3,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, [isVisualEditor]);

  const activeStyle = selectedEl ? {
    fontFamily: getStyleKey("fontFamily") || "inherit",
    fontSize: getStyleKey("fontSize") || "",
    color: getStyleKey("color") || "",
    fontWeight: getStyleKey("fontWeight") || "",
    alignment: getStyleKey("alignment") || "left",
    bold: getStyleKey("bold") || false,
    italic: getStyleKey("italic") || false,
    underline: getStyleKey("underline") || false,
  } : {};

  // Check if selected element belongs to a list
  const isItemInList = selectedEl && /^([a-zA-Z0-9.]+)\.(\d+)(?:\.|$)/.test(selectedEl.path);
  const matchIdx = selectedEl ? selectedEl.path.match(/^([a-zA-Z0-9.]+)\.(\d+)(?:\.|$)/) : null;
  const listIdx = matchIdx ? parseInt(matchIdx[2]) : -1;

  const filteredMediaImages = mediaImages.filter(img => 
    img.toLowerCase().includes(mediaSearch.toLowerCase())
  );

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, playLoader }}>
      <ContentContext.Provider value={{ content, loading: contentLoading }}>
        <div className="grain-overlay" />
        
        {/* Full-screen website loading overlay */}
        <PageLoader active={false} />

        {/* Render actual website */}
        {children}

        {/* Global Round Floating Chat Widget (Hidden on Admin pages) */}
        {!pathname?.startsWith("/admin") && <FloatingChatWidget />}

        {/* 4. DYNAMIC INLINE FLOATING BOX EDITOR OVERLAY */}
        {isVisualEditor && selectedEl && (
          <div
            className="inline-editor-box fixed z-[99999] bg-[#0c0c0c]/95 border border-[#262626] text-white p-4 rounded-2xl shadow-2xl space-y-4 max-w-[325px] font-sans backdrop-blur-md transition-all duration-300"
            style={{
              top: `${Math.min(window.innerHeight - 340, Math.max(8, selectedEl.rect.bottom + 8))}px`,
              left: `${Math.min(window.innerWidth - 340, Math.max(8, selectedEl.rect.left))}px`
            }}
          >
            {/* Box Header */}
            <div className="flex items-center justify-between border-b border-[#222] pb-2">
              <div className="flex items-center gap-1.5 text-blue-400 font-mono text-[9px] uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>{selectedEl.path.split(".").pop()} editor</span>
              </div>
              <button 
                onClick={() => { setSelectedEl(null); setShowMediaList(false); }} 
                className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-white"
              >
                <X size={13} />
              </button>
            </div>

            {/* List Array Actions overlay block */}
            {isItemInList && (
              <div className="bg-[#161616] p-2 rounded-xl flex items-center justify-between gap-1.5 border border-[#222]">
                <button
                  onClick={() => handleMoveUp(selectedEl.path)}
                  disabled={listIdx === 0}
                  className="flex-1 p-1.5 bg-[#222] hover:bg-[#2e2e2e] disabled:opacity-30 rounded text-[9px] font-mono flex items-center justify-center gap-1 text-gray-300"
                  title="Move element up"
                >
                  <ArrowUp size={11} /> Up
                </button>
                <button
                  onClick={() => handleMoveDown(selectedEl.path)}
                  className="flex-1 p-1.5 bg-[#222] hover:bg-[#2e2e2e] rounded text-[9px] font-mono flex items-center justify-center gap-1 text-gray-300"
                  title="Move element down"
                >
                  <ArrowDown size={11} /> Down
                </button>
                <button
                  onClick={() => handleDuplicate(selectedEl.path)}
                  className="flex-1 p-1.5 bg-[#222] hover:bg-[#2e2e2e] rounded text-[9px] font-mono flex items-center justify-center gap-1 text-gray-300"
                  title="Duplicate element"
                >
                  <Copy size={11} /> Copy
                </button>
                <button
                  onClick={() => handleDelete(selectedEl.path)}
                  className="flex-1 p-1.5 bg-red-950/40 hover:bg-red-900/40 rounded text-[9px] font-mono flex items-center justify-center gap-1 text-red-400 border border-red-900/30"
                  title="Delete element"
                >
                  <Trash2 size={11} /> Del
                </button>
                <button
                  onClick={() => handleAddNewItem(selectedEl.path)}
                  className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[9px] font-mono flex items-center justify-center"
                  title="Add new element row"
                >
                  <Plus size={11} />
                </button>
              </div>
            )}

            {/* Input field wrapper */}
            {selectedEl.tagName !== "IMG" ? (
              <div className="space-y-1.5">
                <span className="text-[9px] uppercase tracking-widest text-gray-500 font-mono">Change Text Content</span>
                {selectedEl.path.includes("description") || selectedEl.path.includes("p1") || selectedEl.path.includes("p2") ? (
                  <textarea
                    value={selectedEl.value}
                    onChange={(e) => {
                      setSelectedEl({ ...selectedEl, value: e.target.value });
                      updateContentKey(selectedEl.path, e.target.value);
                    }}
                    rows={4}
                    className="w-full text-xs bg-black p-2.5 border border-[#222] rounded-xl text-white focus:border-[#d1b06c] focus:outline-none"
                  />
                ) : (
                  <input
                    type="text"
                    value={selectedEl.value}
                    onChange={(e) => {
                      setSelectedEl({ ...selectedEl, value: e.target.value });
                      updateContentKey(selectedEl.path, e.target.value);
                    }}
                    className="w-full text-xs bg-black p-2.5 border border-[#222] rounded-xl text-white focus:border-[#d1b06c] focus:outline-none"
                  />
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <span className="text-[9px] uppercase tracking-widest text-gray-500 font-mono">Replace Image</span>
                <div className="aspect-video w-full rounded-xl overflow-hidden border border-[#222] bg-black">
                  <img src={selectedEl.value} className="w-full h-full object-cover" alt="Visual Preview" />
                </div>
                <button
                  onClick={() => setShowMediaList(!showMediaList)}
                  className="w-full flex items-center justify-center gap-1.5 bg-[#1a1a1a] border border-[#2d2d2d] hover:bg-[#262626] text-xs py-2 rounded-xl text-white font-bold transition-all"
                >
                  <FolderOpen size={13} className="text-[#d1b06c]" /> Browse Media Library
                </button>
              </div>
            )}

            {/* Typography Styles */}
            {selectedEl.tagName !== "IMG" && (
              <div className="space-y-3 pt-1">
                {/* Font and size */}
                <div className="flex gap-2">
                  <div className="flex-1 space-y-1">
                    <span className="text-[9px] uppercase tracking-widest text-gray-500 font-mono block">Font Profile</span>
                    <select
                      value={activeStyle.fontFamily}
                      onChange={(e) => setStyleKey("fontFamily", e.target.value)}
                      className="w-full text-[10px] bg-black border border-[#222] p-1.5 rounded text-white"
                    >
                      <option value="inherit">Inherit</option>
                      {GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div className="w-20 space-y-1">
                    <span className="text-[9px] uppercase tracking-widest text-gray-500 font-mono block">Size</span>
                    <input
                      type="number"
                      value={activeStyle.fontSize}
                      onChange={(e) => setStyleKey("fontSize", Number(e.target.value))}
                      placeholder="px"
                      className="w-full text-[10px] bg-black border border-[#222] p-1.5 rounded text-white font-mono text-center"
                    />
                  </div>
                </div>

                {/* Color picker */}
                <div className="flex items-center justify-between bg-black p-1.5 rounded-xl border border-[#222]">
                  <span className="text-[9px] uppercase tracking-widest text-gray-500 font-mono pl-1">Text Color</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={activeStyle.color || "#ffffff"}
                      onChange={(e) => setStyleKey("color", e.target.value)}
                      className="w-6 h-6 rounded bg-transparent border-0 cursor-pointer"
                    />
                    <span className="text-[10px] font-mono text-gray-400 uppercase">{activeStyle.color || "#FFF"}</span>
                  </div>
                </div>

                {/* Font modifiers */}
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setStyleKey("bold", !activeStyle.bold)}
                    className={`flex-1 py-1 text-[10px] border rounded transition-colors ${activeStyle.bold ? "bg-blue-600/20 border-blue-500 text-blue-400" : "bg-black border-[#222] text-gray-400"}`}
                  >
                    <Bold size={11} className="inline mr-1" /> B
                  </button>
                  <button
                    onClick={() => setStyleKey("italic", !activeStyle.italic)}
                    className={`flex-1 py-1 text-[10px] border rounded transition-colors ${activeStyle.italic ? "bg-blue-600/20 border-blue-500 text-blue-400" : "bg-black border-[#222] text-gray-400"}`}
                  >
                    <Italic size={11} className="inline mr-1" /> I
                  </button>
                  <button
                    onClick={() => setStyleKey("underline", !activeStyle.underline)}
                    className={`flex-1 py-1 text-[10px] border rounded transition-colors ${activeStyle.underline ? "bg-blue-600/20 border-blue-500 text-blue-400" : "bg-black border-[#222] text-gray-400"}`}
                  >
                    <Underline size={11} className="inline mr-1" /> U
                  </button>
                </div>

                {/* Alignment */}
                <div className="flex gap-1 border-t border-[#222] pt-2 justify-between items-center">
                  <span className="text-[9px] uppercase text-gray-500 font-mono">Alignment</span>
                  <div className="flex gap-1">
                    {["left", "center", "right"].map((align) => (
                      <button
                        key={align}
                        onClick={() => setStyleKey("alignment", align)}
                        className={`p-1 rounded ${activeStyle.alignment === align ? "bg-blue-600 text-white" : "hover:bg-white/10 text-gray-400"}`}
                      >
                        {align === "left" && <AlignLeft size={12} />}
                        {align === "center" && <AlignCenter size={12} />}
                        {align === "right" && <AlignRight size={12} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* 5. MEDIA GRID OVERLAY MODAL */}
        {isVisualEditor && showMediaList && selectedEl && (
          <div className="inline-media-box fixed inset-0 z-[999999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0f0f0f] border border-[#222] rounded-2xl w-full max-w-2xl max-h-[70vh] flex flex-col overflow-hidden shadow-2xl">
              
              <div className="p-4 border-b border-[#222] flex items-center justify-between bg-black/40">
                <span className="text-xs uppercase font-mono tracking-widest text-white font-semibold">Select Local Photography Asset</span>
                <button
                  onClick={() => setShowMediaList(false)}
                  className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Upload & Search controls */}
              <div className="p-3 border-b border-[#222] bg-[#141414] flex gap-3 items-center justify-between">
                <div className="relative flex-1">
                  <Search size={13} className="absolute left-3 top-3 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search image..."
                    value={mediaSearch}
                    onChange={(e) => setMediaSearch(e.target.value)}
                    className="w-full bg-[#1e1e1e] border border-[#2e2e2e] rounded-full pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
                <label className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-mono px-3.5 py-2 rounded-full cursor-pointer transition-all shadow-md">
                  <Upload size={12} /> Upload
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>

              {/* Scroll grid */}
              <div className="flex-1 overflow-y-auto p-4 grid grid-cols-3 sm:grid-cols-5 gap-3 bg-[#080808]">
                {filteredMediaImages.length > 0 ? (
                  filteredMediaImages.map((img, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setSelectedEl({ ...selectedEl, value: img });
                        updateContentKey(selectedEl.path, img);
                        setShowMediaList(false);
                      }}
                      className="group aspect-square rounded-xl overflow-hidden border border-[#222] cursor-pointer hover:border-blue-500 transition-all bg-[#111]"
                    >
                      <img src={img} className="w-full h-full object-cover" alt="Media Asset" />
                    </div>
                  ))
                ) : (
                  <div className="col-span-full h-40 flex flex-col items-center justify-center text-gray-600 text-xs">
                    No images found
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </ContentContext.Provider>
    </ThemeContext.Provider>
  );
}
