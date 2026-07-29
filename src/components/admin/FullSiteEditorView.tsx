"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Monitor, Smartphone, Tablet, ZoomIn, Undo2, Redo2,
  Save, RefreshCw, Layers, ChevronDown, Check, Globe
} from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  isDark: boolean;
  content: any;
  saveTransaction: (action: string, payload: any) => Promise<boolean>;
}

type DeviceType = "desktop" | "tablet" | "mobile";

export default function FullSiteEditorView({ isDark, content, saveTransaction }: Props) {
  const [local, setLocal] = useState<any>(JSON.parse(JSON.stringify(content)));
  const [history, setHistory] = useState<any[]>([JSON.parse(JSON.stringify(content))]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [activePage, setActivePage] = useState<string>("home");
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [zoom, setZoom] = useState<number>(100);
  const [publishing, setPublishing] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Sync state changes with iframe
  const syncIframeContent = useCallback((contentState: any) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_PREVIEW_CONTENT", content: contentState },
        "*"
      );
    }
  }, []);

  // Sync prop updates
  useEffect(() => {
    if (content) {
      const copy = JSON.parse(JSON.stringify(content));
      setLocal(copy);
      setHistory([copy]);
      setHistoryIndex(0);
      syncIframeContent(copy);
    }
  }, [content, syncIframeContent]);

  // Debounced auto-save handler
  const debounceTimer = useRef<any>(null);
  const autoSaveStaged = useCallback((updatedState: any) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      await saveTransaction("save_content", updatedState);
    }, 1200);
  }, [saveTransaction]);

  // Listen to AUTOSAVE_CONTENT from the inline editor inside iframe
  useEffect(() => {
    const handleFrameMessage = (e: MessageEvent) => {
      const data = e.data;
      if (data && data.type === "AUTOSAVE_CONTENT") {
        setLocal(data.content);
        
        // Push to history stack
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(data.content);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);

        autoSaveStaged(data.content);
      }
    };
    window.addEventListener("message", handleFrameMessage);
    return () => window.removeEventListener("message", handleFrameMessage);
  }, [history, historyIndex, autoSaveStaged]);

  // Undo/Redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      const copy = JSON.parse(JSON.stringify(history[prevIndex]));
      setLocal(copy);
      syncIframeContent(copy);
      autoSaveStaged(copy);
      toast.success("Undo applied", { duration: 1000 });
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      const copy = JSON.parse(JSON.stringify(history[nextIndex]));
      setLocal(copy);
      syncIframeContent(copy);
      autoSaveStaged(copy);
      toast.success("Redo applied", { duration: 1000 });
    }
  };

  // Publish manual action
  const handlePublish = async () => {
    setPublishing(true);
    const tid = toast.loading("Publishing all changes live...");
    const ok = await saveTransaction("save_content", local);
    setPublishing(false);
    if (ok) {
      toast.success("All updates are live on the user website!", { id: tid });
    } else {
      toast.error("Failed to publish edits", { id: tid });
    }
  };

  const getIframeUrl = () => {
    const base = "/?visual_editor=true";
    switch (activePage) {
      case "home": return base;
      case "about": return `${base}#about`;
      case "services": return `/services/wedding?visual_editor=true`;
      case "gallery": return base;
      case "frames": return `/photo-frames?visual_editor=true`;
      case "testimonials": return `${base}#testimonials`;
      case "contact": return `${base}#contact`;
      default: return base;
    }
  };

  const pagesList = [
    { id: "home", label: "Homepage Layout" },
    { id: "about", label: "About Section" },
    { id: "services", label: "Interactive Services" },
    { id: "gallery", label: "Portfolio Gallery" },
    { id: "frames", label: "Photo Frames Store" },
    { id: "testimonials", label: "Client Testimonials" },
    { id: "contact", label: "Contact Details" }
  ];

  return (
    <div className={`flex flex-col h-[calc(100vh-140px)] w-full overflow-hidden ${isDark ? "bg-[#080808] text-white" : "bg-[#f9f9f9] text-black"}`}>
      
      {/* TOP COMPACT NAVIGATION BAR */}
      <div className={`flex flex-wrap items-center justify-between px-6 py-3 border-b ${isDark ? "bg-[#111] border-[#222]" : "bg-white border-gray-200"} z-40 shadow-sm gap-4`}>
        
        {/* Page Switcher Dropdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#1a1a1a] px-3 py-1.5 rounded-xl border border-[#2d2d2d] relative group cursor-pointer">
            <Globe size={13} className="text-[#d1b06c]" />
            <select
              value={activePage}
              onChange={(e) => {
                setActivePage(e.target.value);
                toast.success(`Switched view to ${e.target.value}`);
              }}
              className="bg-transparent text-xs text-white outline-none cursor-pointer pr-1 font-semibold"
            >
              {pagesList.map(p => (
                <option key={p.id} value={p.id} className="bg-[#111] text-white">{p.label}</option>
              ))}
            </select>
          </div>
          
          <div className="h-4 w-px bg-[#2d2d2d]" />
          
          <span className="text-[10px] text-gray-500 font-mono">
            Hover & Click elements inside preview to edit them directly.
          </span>
        </div>

        {/* Center Viewport presets */}
        <div className="flex items-center gap-3">
          {/* Responsive device buttons */}
          <div className="flex items-center gap-1 bg-[#1a1a1a] p-1 rounded-lg border border-[#2c2c2c]">
            <button
              onClick={() => setDevice("desktop")}
              className={`p-1.5 rounded-md transition-colors ${device === "desktop" ? "bg-white/10 text-white" : "text-gray-500"}`}
              title="Desktop Screen View"
            >
              <Monitor size={15} />
            </button>
            <button
              onClick={() => setDevice("tablet")}
              className={`p-1.5 rounded-md transition-colors ${device === "tablet" ? "bg-white/10 text-white" : "text-gray-500"}`}
              title="Tablet Viewport"
            >
              <Tablet size={15} />
            </button>
            <button
              onClick={() => setDevice("mobile")}
              className={`p-1.5 rounded-md transition-colors ${device === "mobile" ? "bg-white/10 text-white" : "text-gray-500"}`}
              title="Mobile Viewport"
            >
              <Smartphone size={15} />
            </button>
          </div>

          {/* Zoom scale */}
          <div className="flex items-center gap-1 bg-[#1a1a1a] px-2 py-1 rounded-lg border border-[#2c2c2c]">
            <ZoomIn size={13} className="text-gray-500" />
            <select
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="bg-transparent border-0 text-[10px] text-white outline-none cursor-pointer"
            >
              <option value="50" className="bg-[#111]">50% Zoom</option>
              <option value="75" className="bg-[#111]">75%</option>
              <option value="100" className="bg-[#111]">100%</option>
              <option value="125" className="bg-[#111]">125%</option>
              <option value="150" className="bg-[#111]">150%</option>
            </select>
          </div>
        </div>

        {/* Right side Undo/Redo/Save */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#1a1a1a] p-0.5 rounded-lg border border-[#2c2c2c]">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className={`p-1.5 rounded-md transition-colors ${historyIndex > 0 ? "hover:bg-white/10 text-white" : "text-gray-600 cursor-not-allowed"}`}
              title="Undo Visual Action (Ctrl+Z)"
            >
              <Undo2 size={15} />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className={`p-1.5 rounded-md transition-colors ${historyIndex < history.length - 1 ? "hover:bg-white/10 text-white" : "text-gray-600 cursor-not-allowed"}`}
              title="Redo Visual Action (Ctrl+Y)"
            >
              <Redo2 size={15} />
            </button>
          </div>

          <button
            onClick={handlePublish}
            disabled={publishing}
            className="flex items-center gap-1 bg-[#d1b06c] hover:bg-[#bda062] active:scale-[0.98] text-black font-bold text-xs px-4.5 py-2 rounded-xl transition-all shadow-md disabled:opacity-50"
          >
            <Save size={13} />
            {publishing ? "Saving..." : "Publish Live"}
          </button>
        </div>

      </div>

      {/* MID PREVIEW IFRAME FULLSCREEN CANVAS CONTAINER */}
      <div className="flex-1 bg-[#151515] flex flex-col items-center p-6 transition-all duration-300 relative overflow-hidden h-full">
        
        <div
          className="transition-all duration-500 flex flex-col shadow-2xl rounded-3xl overflow-hidden border border-[#2c2c2c] bg-[var(--background)] w-full"
          style={{
            width: device === "mobile" ? "375px" : device === "tablet" ? "768px" : "100%",
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
            height: `${100 / (zoom / 100)}%`
          }}
        >
          {/* Live Page Preview Frame with Inline Visual Editor Overlays inside */}
          <iframe
            ref={iframeRef}
            name="visual-editor-preview"
            src={getIframeUrl()}
            className="w-full h-full border-0 bg-[var(--background)]"
            onLoad={() => {
              syncIframeContent(local);
            }}
          />
        </div>

      </div>

    </div>
  );
}
