"use client";

import React from "react";

type TextRevealStyle = "words" | "chars" | "mask";

interface TextRevealProps {
  text: string;
  style?: TextRevealStyle;
  className?: string;
  delayMs?: number;
}

export default function TextReveal({
  text,
  style = "words",
  className = "",
  delayMs = 0,
}: TextRevealProps) {
  return (
    <div className={className}>
      {text}
    </div>
  );
}
