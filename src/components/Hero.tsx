"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import { useTheme, useContent } from "@/components/Providers";

export default function Hero() {
  const { theme } = useTheme();
  const { content } = useContent();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isFiring, setIsFiring] = useState(false);

  const heroContent = content?.hero;

  const handleBookClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
      const nameInput = document.getElementById("name");
      if (nameInput) {
        nameInput.focus();
      }
    } else {
      window.location.href = "/#contact";
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const mouse = { x: width / 2, y: height / 2, tx: width / 2, ty: height / 2 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.tx = e.clientX;
      mouse.ty = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    const blobs = [
      { x: width * 0.25, y: height * 0.25, r: 250, vx: 0.5, vy: 0.3, color: "rgba(209, 176, 108, 0.15)" },
      { x: width * 0.75, y: height * 0.75, r: 350, vx: -0.3, vy: -0.5, color: "rgba(139, 157, 131, 0.1)" },
      { x: width * 0.5, y: height * 0.5, r: 300, vx: 0.2, vy: -0.4, color: "rgba(100, 100, 200, 0.05)" },
    ];

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      mouse.x += (mouse.tx - mouse.x) * 0.08;
      mouse.y += (mouse.ty - mouse.y) * 0.08;

      blobs.forEach((blob) => {
        blob.x += blob.vx;
        blob.y += blob.vy;

        if (blob.x - blob.r < 0 || blob.x + blob.r > width) blob.vx *= -1;
        if (blob.y - blob.r < 0 || blob.y + blob.r > height) blob.vy *= -1;

        const targetX = blob.x + (mouse.x - width / 2) * 0.05;
        const targetY = blob.y + (mouse.y - height / 2) * 0.05;

        const grad = ctx.createRadialGradient(targetX, targetY, 0, targetX, targetY, blob.r);
        grad.addColorStop(0, blob.color);
        grad.addColorStop(1, "rgba(6, 8, 12, 0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(targetX, targetY, blob.r, 0, Math.PI * 2);
        ctx.fill();
      });

      const mouseGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 150);
      mouseGrad.addColorStop(0, "rgba(209, 176, 108, 0.08)");
      mouseGrad.addColorStop(1, "rgba(6, 8, 12, 0)");
      ctx.fillStyle = mouseGrad;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 150, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section
      id="home"
      className="relative w-full bg-[#0a0a0a] text-white overflow-hidden select-none"
    >
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* ═══════════════════════════════════════════════════ */}
      {/* MOBILE VIEW — Image only, NO text, pushed below top bar */}
      {/* ═══════════════════════════════════════════════════ */}
      <div className="md:hidden relative z-[1] pt-[56px]">
        <div className="relative w-full h-[65vh] min-h-[380px] max-h-[560px]">
          <img
            data-edit-id="hero.mobileBackgroundImage"
            src={heroContent?.mobileBackgroundImage || "/img/hero-mobile.jpg"}
            alt="SK Studio Pune Mobile Hero"
            className="w-full h-full object-cover object-center"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

          {/* Text Removed from Mobile View per user request */}

          {/* Book a Session Button at bottom of mobile hero image */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none z-20">
            <Reveal style="blur" delayMs={100} className="pointer-events-auto">
              <div className="animate-auto-float relative group">
                <div className="absolute -inset-3 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.7)_0%,rgba(242,169,79,0.3)_45%,transparent_70%)] blur-lg opacity-90 pointer-events-none transition-all duration-300 group-hover:opacity-100 group-hover:scale-110" />
                <a
                  data-edit-id="hero.btn2Text"
                  href="#contact"
                  onClick={handleBookClick}
                  className={`shutter-btn clickable text-xs font-bold tracking-wider px-6 py-3 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.8),0_4px_20px_rgba(0,0,0,0.4)] bg-white text-black border border-white/90 backdrop-blur-md transition-all duration-200 hover:scale-105 select-none ${
                    isFiring ? "firing" : ""
                  }`}
                  style={{ backgroundColor: "#ffffff", color: "#000000" }}
                >
                  <span className="shutter-label font-bold text-black" style={{ color: "#000000" }}>
                    <span className="text-black">{heroContent?.btn2Text || "Book a Session"}</span>
                    <ArrowRight size={14} className="text-black stroke-[2.5]" />
                  </span>
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════ */}
      {/* DESKTOP/LAPTOP VIEW — Full-bleed Ultra-HD Hero */}
      {/* ═══════════════════════════════════════════════════ */}
      <div className="hidden md:flex h-screen min-h-[640px] relative z-[1]">
        {/* Background Image Container — Full Bleed Edge-to-Edge */}
        <div className="absolute inset-0 z-0 bg-black">
          <img
            data-edit-id="hero.backgroundImage"
            src={heroContent?.backgroundImage || "/images/hero-desktop.jpg"}
            alt="SK Studio Pune Hero"
            className="w-full h-full object-cover object-center transition-all duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/10 to-black/30 pointer-events-none" />
        </div>

        {/* Right Side Text Container Box */}
        <div className="relative z-10 w-full h-full flex items-end pb-12 lg:pb-16 justify-end pr-12 lg:pr-20 xl:pr-28">
          <Reveal style="blur" delayMs={200}>
            <div className="max-w-md lg:max-w-lg xl:max-w-xl backdrop-blur-sm bg-black/15 border border-white/20 rounded-3xl p-8 lg:p-10 shadow-2xl">
              <h1
                data-edit-id="hero.title"
                className="text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight tracking-tight mb-4"
              >
                {heroContent?.title || "SK Photo Studio"}
              </h1>
              <p
                data-edit-id="hero.description"
                className="text-sm lg:text-base text-white/80 leading-relaxed mb-8"
              >
                {heroContent?.description || "Premium photography studio in Pune capturing your most precious moments with artistic excellence and creative vision."}
              </p>

              {/* Book a Session Button */}
              <div className="animate-auto-float relative group inline-block">
                <div className="absolute -inset-3 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.7)_0%,rgba(242,169,79,0.3)_45%,transparent_70%)] blur-lg opacity-90 pointer-events-none transition-all duration-300 group-hover:opacity-100 group-hover:scale-110" />
                <a
                  data-edit-id="hero.btn2Text"
                  href="#contact"
                  onClick={handleBookClick}
                  className={`shutter-btn clickable text-sm font-bold tracking-wider px-7 py-3.5 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.8),0_4px_20px_rgba(0,0,0,0.4)] bg-white text-black border border-white/90 backdrop-blur-md transition-all duration-200 hover:scale-105 select-none ${
                    isFiring ? "firing" : ""
                  }`}
                  style={{ backgroundColor: "#ffffff", color: "#000000" }}
                >
                  <span className="shutter-label font-bold text-black" style={{ color: "#000000" }}>
                    <span className="text-black">{heroContent?.btn2Text || "Book a Session"}</span>
                    <ArrowRight size={15} className="text-black stroke-[2.5]" />
                  </span>
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
