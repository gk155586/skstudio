"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Camera, Film, Heart, Sparkles, Smile, Image as ImageIcon } from "lucide-react";
import Reveal from "@/components/Reveal";
import TextReveal from "@/components/TextReveal";
import { useContent } from "@/components/Providers";

interface ServiceItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  details: string[];
  image: string;
  slug: string;
}

export default function Services() {
  const { content } = useContent();
  const galleries = content?.categoryGalleries || {};

  const defaultServices: ServiceItem[] = [
    {
      id: "srv-wedding",
      icon: <Heart className="text-[var(--accent)]" size={28} />,
      title: "Wedding Segment",
      description: "Premium cinematic wedding films and photography covering traditional, candid, and destination stories.",
      details: ["Multiple Sessions (Up to 12 Hours)", "Drone Coverage & Raw Files", "Cinematography & Cinematic Teasers", "3 Bound Albums Included"],
      image: "/img/gallery/wedding/wedding-cover.jpg",
      slug: "wedding",
    },
    {
      id: "srv-prewedding",
      icon: <Sparkles className="text-[var(--accent)]" size={28} />,
      title: "Pre-Wedding Shoot",
      description: "Stunning couples portraits shot on premium sets and scenic outdoor locations around Pune.",
      details: ["Curated Backdrops & Locations", "Outfits & Makeup Services", "Instagram Reels & Cinematic Cuts", "Delivery in 30 Days"],
      image: "/img/gallery/pre-wedding/pre-wedding-cover.jpg",
      slug: "pre-wedding",
    },
    {
      id: "srv-maternity-indoor",
      icon: <Camera className="text-[var(--accent)]" size={28} />,
      title: "Maternity Indoor",
      description: "Elegant pregnancy portraiture showcasing the journey of motherhood in premium gown collections in our climate-controlled studio.",
      details: ["35+ Gown Selection Access", "Bespoke Prop Sets", "Private Comfort Changing Rooms", "15 Retouched High-End Edits"],
      image: "/img/gallery/maternity-indoor/maternity-indoor-cover.jpeg",
      slug: "maternity-indoor",
    },
    {
      id: "srv-maternity-outdoor",
      icon: <Camera className="text-[var(--accent)]" size={28} />,
      title: "Maternity Outdoor",
      description: "Scenic, glowing natural light maternity portraits captured at Pune's most beautiful lakes and custom private farms.",
      details: ["Golden Hour Sunset Sessions", "Drone Reels & Cinematic Footage", "Outdoors Gown Fitting Assistant", "All Raw Conversions Delivered"],
      image: "/img/gallery/maternity-outdoor/1/SKO00321.JPG",
      slug: "maternity-outdoor",
    },
    {
      id: "srv-baby-indoor",
      icon: <Smile className="text-[var(--accent)]" size={28} />,
      title: "Baby Indoor",
      description: "Delightful baby indoor studio sessions with sterilized themed props and temperature-controlled settings.",
      details: ["Curated toddler props", "Organic safe wraps & fabrics", "Temperature-controlled floor", "High-res edited frames"],
      image: "/img/gallery/baby-indoor/IMG_2457.JPG.jpeg",
      slug: "baby-indoor",
    },
    {
      id: "srv-baby-outdoor",
      icon: <Smile className="text-[var(--accent)]" size={28} />,
      title: "Baby Outdoor",
      description: "Vibrant baby outdoor photography capturing playful giggles and candid moments amidst green parks and sunny fields.",
      details: ["Natural daylight shooting", "Sterilized themed toys", "Candid sibling highlights", "Layflat digital album delivery"],
      image: "/img/gallery/baby-outdoor/1/SKO03266.JPG",
      slug: "baby-outdoor",
    },
    {
      id: "srv-newborn",
      icon: <Smile className="text-[var(--accent)]" size={28} />,
      title: "Newborn Shoot",
      description: "Capturing the purest initial days of your newborn in safe wrapping styles by certified baby safety handlers.",
      details: ["Certified Newborn Safety Handlers", "Classic basket and nest themes", "Parent and baby sibling portrait captures", "Premium wooden frame prints"],
      image: "/img/gallery/newborn/newborn-cover.jpeg",
      slug: "newborn",
    },
    {
      id: "srv-frames",
      icon: <ImageIcon className="text-[var(--accent)]" size={28} />,
      title: "Custom Photo Frames",
      description: "Premium handcrafted photo frames, available in various sizes and finishes to preserve your memories.",
      details: ["Premium Wood & Acrylic", "Custom Sizes", "Matte & Glossy Finishes", "Fast Delivery"],
      image: "/images/frames-preview.jpg",
      slug: "photo-frames",
    },
  ];

  const getDynamicIcon = (slug: string) => {
    switch (slug) {
      case "wedding": return <Heart className="text-[var(--accent)]" size={28} />;
      case "pre-wedding": return <Sparkles className="text-[var(--accent)]" size={28} />;
      case "photo-frames": return <ImageIcon className="text-[var(--accent)]" size={28} />;
      case "maternity-indoor":
      case "maternity-outdoor": return <Camera className="text-[var(--accent)]" size={28} />;
      default: return <Smile className="text-[var(--accent)]" size={28} />;
    }
  };

  const services: ServiceItem[] = (content?.services || []).length > 0
    ? content.services.map((s: any) => ({
        ...s,
        icon: getDynamicIcon(s.slug || "")
      }))
    : defaultServices;

  return (
    <section id="services" className="pt-6 pb-10 md:pt-10 md:pb-14 px-4 md:px-12 bg-[#FAFAFA] relative overflow-hidden">
      
      <div className="max-w-6xl mx-auto flex flex-col gap-2 md:gap-4">
        
        {/* ELEGANT CLASSICAL HEADER */}
        <div className="w-full flex flex-col items-center justify-center text-center mt-0">
          <span className="text-[10px] md:text-xs font-sans tracking-[0.4em] text-gray-500 uppercase font-medium mb-2 flex items-center gap-4">
            <span className="w-12 h-[1px] bg-gray-300" />
            Curated Services
            <span className="w-12 h-[1px] bg-gray-300" />
          </span>
          <h2 className="text-4xl md:text-6xl lg:text-[70px] font-normal text-gray-900 font-serif leading-[1.1] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
            SK STUDIO'S ALBUM
          </h2>
          <p className="mt-2 text-sm md:text-base text-gray-500 font-sans font-light max-w-xl leading-relaxed">
            Elegant photography and cinematography collections, beautifully crafted to preserve your most cherished memories for a lifetime.
          </p>
        </div>

        {/* EXACT ALBUM SPREADS FROM SCREENSHOT */}
        <div className="flex flex-col w-full pb-0 bg-[#FAFAFA]">
          
          {/* Helper to get images */}
          {(() => {
            const nestedImgs = services.map((s, idx) => {
              const galleryImages = galleries[s.slug]?.images || [];
              if (galleryImages.length > 0) {
                return galleryImages.map((img: any) => img.url);
              }
              // If the API provided a broken /img/blog/ path, use the local default image instead
              if (s.image && !s.image.includes("/img/blog/")) {
                return [s.image];
              }
              return [defaultServices[idx % defaultServices.length].image];
            });
            const allImgs: string[] = [];
            if (nestedImgs.length > 0) {
              const maxLen = Math.max(...nestedImgs.map(arr => arr.length));
              for (let i = 0; i < maxLen; i++) {
                for (let j = 0; j < nestedImgs.length; j++) {
                  if (nestedImgs[j][i]) allImgs.push(nestedImgs[j][i]);
                }
              }
            }

            const fallbackImgs = [
              "/img/gallery/family-photoshoot/SK_00698_copy.jpg",
              "/img/gallery/baby-outdoor/SK_00521.jpg",
              "/img/gallery/Eyara/SK_09234_copy.jpg",
              "/img/gallery/baby-indoor/SK_01541_copy.jpg",
              "/img/gallery/baby-outdoor/12/SK_00717.JPG",
              "/img/gallery/Eyara/SK_09224_copy.jpg",
              "/img/gallery/baby-outdoor/SK_00644_copy.jpg",
              "/img/gallery/baby-outdoor/SK_08533_copy.jpg",
              "/img/gallery/baby-outdoor/1/SKO03363.JPG",
              "/img/gallery/baby-outdoor/3/SK_09073.JPG",
              "/img/gallery/baby-indoor/SK_06851.JPG",
              "/img/gallery/baby-outdoor/SK_00527.jpg",
              "/img/gallery/baby-outdoor/SK_08550.jpg",
              "/img/gallery/family-photoshoot/SK_00587_copy.jpg",
              "/img/gallery/baby-outdoor/10/SK_03707.JPG",
              "/img/gallery/baby-indoor/SK_08278.JPG",
              "/img/gallery/baby-outdoor/SK_00539.jpg",
              "/img/gallery/baby-indoor/SK_01928_copy.jpg",
              "/img/gallery/baby-outdoor/8/SK_00123_copy.jpg",
              "/img/gallery/wedding/wedding-cover.jpg",
            ];

            // Guarantee we have at least 19 unique images so there is NEVER a visual repeat
            let idxPointer = 0;
            while (allImgs.length < 19) {
              if (!allImgs.includes(fallbackImgs[idxPointer % fallbackImgs.length])) {
                 allImgs.push(fallbackImgs[idxPointer % fallbackImgs.length]);
              }
              idxPointer++;
            }

            const getImg = (idx: number) => {
              if (allImgs.length === 0) return "/img/gallery/wedding/wedding-cover.jpg";
              const rawUrl = allImgs[idx % allImgs.length];
              return rawUrl ? encodeURI(rawUrl) : "/img/gallery/wedding/wedding-cover.jpg";
            };

            return (
              <>
                {/* ROW 1 */}
                <div className="flex flex-col md:flex-row w-full h-auto md:h-[500px] gap-4 md:gap-8 mt-2 md:mt-4">
                  {/* Left: Single tall image */}
                  <Reveal style="slide-up" className="w-full md:w-[25%] h-[400px] md:h-full relative overflow-hidden">
                    <Image src="/images/row1_1_fixed.jpg" alt="Album 1" fill sizes="(max-width: 768px) 100vw, 25vw" className="object-cover" />
                  </Reveal>
                  {/* Middle: Two images side-by-side with rounded bottom */}
                  <Reveal style="slide-up" delayMs={100} className="w-full md:w-[35%] h-[400px] md:h-full relative flex flex-col bg-white">
                    <div className="flex-1 w-full flex gap-2 rounded-b-[4rem] overflow-hidden">
                      <div className="w-1/2 h-full relative"><Image src="/images/row1_2_fixed_v2.jpg" alt="Album 2" fill sizes="(max-width: 768px) 50vw, 18vw" className="object-cover" /></div>
                      <div className="w-1/2 h-full relative"><Image src="/images/row1_3_fixed.jpg" alt="Album 3" fill sizes="(max-width: 768px) 50vw, 18vw" className="object-cover object-top" /></div>
                    </div>
                  </Reveal>
                  {/* Right: Collage with Pill */}
                  <Reveal style="slide-up" delayMs={200} className="w-full md:w-[40%] h-[400px] md:h-full relative">
                    <div className="w-full h-full relative overflow-hidden rounded-t-[3rem] md:rounded-t-none md:rounded-tr-[5rem] md:rounded-br-[2rem]"><Image src={getImg(3)} alt="Album 4" fill sizes="(max-width: 768px) 100vw, 40vw" className="object-cover object-center" /></div>
                  </Reveal>
                </div>

                {/* ROW 2 */}
                <div className="flex flex-col md:flex-row w-full h-auto md:h-[500px] gap-4 md:gap-8 mt-16 md:mt-24">
                  {/* Left: Large image + small bordered image */}
                  <Reveal style="slide-up" className="w-full md:w-[40%] h-[400px] md:h-full relative flex items-center">
                    <div className="w-[60%] h-[90%] relative overflow-hidden rounded-md shadow-lg z-0"><Image src="/img/gallery/baby-outdoor/SK_00582_fixed.jpg" alt="Album 6" fill sizes="(max-width: 768px) 60vw, 25vw" className="object-cover" /></div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[45%] h-[70%] z-10 shadow-xl">
                      <div className="w-full h-full relative overflow-hidden rounded-md"><Image src={getImg(6)} alt="Album 7" fill sizes="(max-width: 768px) 45vw, 20vw" className="object-cover object-top" /></div>
                    </div>
                  </Reveal>
                  {/* Middle: Arch Top Right */}
                  <Reveal style="slide-up" delayMs={100} className="w-full md:w-[30%] h-[400px] md:h-full relative overflow-hidden rounded-md md:rounded-tr-[6rem]">
                    <Image src="/images/center_fixed.jpg" alt="Album 8" fill sizes="(max-width: 768px) 100vw, 30vw" className="object-cover object-center" />
                  </Reveal>
                  {/* Right: Two overlapping images with cutout look */}
                  <Reveal style="slide-up" delayMs={200} className="w-full md:w-[30%] h-[400px] md:h-full relative">
                    <div className="w-[80%] h-[70%] absolute right-0 top-0 overflow-hidden rounded-md"><Image src={getImg(8)} alt="Album 9" fill sizes="(max-width: 768px) 80vw, 25vw" className="object-cover object-top" /></div>
                    <div className="w-[60%] h-[60%] absolute left-0 bottom-10 overflow-hidden rounded-l-full shadow-2xl"><Image src="/images/right_fixed.jpg" alt="Album 10" fill sizes="(max-width: 768px) 60vw, 20vw" className="object-cover" /></div>
                  </Reveal>
                </div>

                {/* ROW 3 */}
                <div className="flex flex-col md:flex-row w-full h-auto md:h-[400px] gap-4 md:gap-8 mt-16 md:mt-24">
                  {/* Left: Large Landscape */}
                  <Reveal style="slide-up" className="w-full md:w-[50%] h-[400px] md:h-full relative overflow-hidden rounded-md">
                    <Image src={getImg(10)} alt="Album 11" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover object-top" />
                  </Reveal>
                  {/* Middle: Portrait */}
                  <Reveal style="slide-up" delayMs={100} className="w-full md:w-[25%] h-[400px] md:h-full relative overflow-hidden rounded-md">
                    <Image src={getImg(11)} alt="Album 12" fill sizes="(max-width: 768px) 100vw, 25vw" className="object-cover object-top" />
                  </Reveal>
                  {/* Right: Grid of 3 */}
                  <Reveal style="slide-up" delayMs={200} className="w-full md:w-[25%] h-[400px] md:h-full flex flex-col bg-white p-2 md:p-0">
                    <div className="flex-1 w-full flex gap-2">
                      <div className="w-1/2 h-full relative overflow-hidden"><Image src={getImg(12)} alt="Album 13" fill sizes="(max-width: 768px) 50vw, 12vw" className="object-cover" /></div>
                      <div className="w-1/2 h-full flex flex-col gap-2">
                        <div className="w-full h-[50%] relative overflow-hidden"><Image src={getImg(13)} alt="Album 14" fill sizes="(max-width: 768px) 50vw, 12vw" className="object-cover object-top" /></div>
                        <div className="w-full h-[50%] relative overflow-hidden"><Image src="/images/row3_last_fixed.jpg" alt="Album 15" fill sizes="(max-width: 768px) 50vw, 12vw" className="object-cover object-bottom" /></div>
                      </div>
                    </div>
                  </Reveal>
                </div>

                {/* ROW 4 */}
                <div className="flex flex-col md:flex-row w-full h-auto md:h-[500px] gap-4 md:gap-8 mt-16 md:mt-24">
                  {/* Left: Overlapping portrait */}
                  <Reveal style="slide-up" className="w-full md:w-[30%] h-[400px] md:h-full relative">
                    <div className="w-[85%] h-[80%] absolute left-0 top-0 overflow-hidden rounded-md"><Image src={getImg(15)} alt="Album 16" fill sizes="(max-width: 768px) 85vw, 25vw" className="object-cover object-top" /></div>
                    <div className="w-[55%] h-[45%] absolute right-0 bottom-4 shadow-lg overflow-hidden rounded-sm"><div className="w-full h-full relative"><Image src="/images/row4_overlap_fixed.jpg" alt="Album 17" fill sizes="(max-width: 768px) 55vw, 18vw" className="object-cover" /></div></div>
                  </Reveal>
                  {/* Middle: Single portrait */}
                  <Reveal style="slide-up" delayMs={100} className="w-full md:w-[30%] h-[400px] md:h-full relative overflow-hidden rounded-md">
                    <Image src={getImg(17)} alt="Album 18" fill sizes="(max-width: 768px) 100vw, 30vw" className="object-cover object-top" />
                  </Reveal>
                  {/* Right: Large Portrait */}
                  <Reveal style="slide-up" delayMs={200} className="w-full md:w-[40%] h-[400px] md:h-full flex flex-col">
                    <div className="flex-1 w-full relative overflow-hidden rounded-md">
                      <Image src="/images/row4_last_fixed.jpg" alt="Album 19" fill sizes="(max-width: 768px) 100vw, 40vw" className="object-cover object-top" />
                    </div>
                  </Reveal>
                </div>

              </>
            );
          })()}
        </div>
      </div>
    </section>
  );
}
