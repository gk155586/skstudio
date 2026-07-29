"use client";

import React from "react";

interface PageLoaderProps {
  active: boolean;
}

export default function PageLoader({ active }: PageLoaderProps) {
  return (
    <div
      className={`site-loader-overlay ${
        active ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
      }`}
      aria-hidden={!active}
    >
      <div className="loader">
        <div className="text"><span>Loading</span></div>
        <div className="text"><span>Loading</span></div>
        <div className="text"><span>Loading</span></div>
        <div className="text"><span>Loading</span></div>
        <div className="text"><span>Loading</span></div>
        <div className="text"><span>Loading</span></div>
        <div className="text"><span>Loading</span></div>
        <div className="text"><span>Loading</span></div>
        <div className="text"><span>Loading</span></div>
        <div className="line"></div>
      </div>
    </div>
  );
}
