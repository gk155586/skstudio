"use client";

import React from "react";

type RevealStyle = string;

interface RevealProps {
  children: React.ReactNode;
  style?: RevealStyle;
  className?: string;
  delayMs?: number;
}

export default function Reveal({
  children,
  style = "blur",
  className = "",
  delayMs = 0,
}: RevealProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
