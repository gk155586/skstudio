"use client";

import React, { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Boundary caught error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-[#0d0d0d] text-white font-sans antialiased min-h-screen flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-[#161616] border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center font-bold text-xl">
            !
          </div>
          <h2 className="text-xl font-bold tracking-tight font-display">Global Application Error</h2>
          <p className="text-xs text-gray-400 font-mono leading-relaxed">
            {error.message || "A critical error occurred while loading application layout."}
          </p>
          <button
            onClick={() => reset()}
            className="mt-2 px-6 py-3 bg-[#b08d4b] hover:bg-[#96753a] text-black font-bold text-xs uppercase tracking-widest rounded-full transition-all shadow-md"
          >
            Refresh Page
          </button>
        </div>
      </body>
    </html>
  );
}
