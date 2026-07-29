"use client";

import React from "react";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  variant?: "text" | "circular" | "rectangular";
}

export default function Skeleton({
  width = "100%",
  height = "200px",
  className = "",
  variant = "rectangular",
}: SkeletonProps) {
  const variantStyles = {
    text: "rounded-full",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  return (
    <div
      className={`
        animate-pulse
        bg-gradient-to-r from-[var(--card-border)] via-[var(--background)] to-[var(--card-border)]
        ${variantStyles[variant]}
        ${className}
      `}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
      }}
    />
  );
}
