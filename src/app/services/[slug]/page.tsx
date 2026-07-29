import React from "react";
import fs from "fs";
import path from "path";
import { redirect } from "next/navigation";
import CategoryGalleryView from "@/components/CategoryGalleryView";

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface GalleryImage {
  id: string;
  url: string;
  title: string;
  description: string;
}

// Fetch category details from content.json
async function getCategoryData(slug: string) {
  const contentPath = path.join(process.cwd(), "data", "content.json");
  let categoryImages: GalleryImage[] = [];
  
  try {
    if (fs.existsSync(contentPath)) {
      const fileData = fs.readFileSync(contentPath, "utf8");
      const json = JSON.parse(fileData);
      
      // Try to find direct key match first
      if (json.categoryGalleries && json.categoryGalleries[slug]) {
        categoryImages = json.categoryGalleries[slug].images || [];
      } else {
        // Fallback matching logic
        let key = slug;
        if (slug.includes("maternity")) key = "maternity";
        else if (slug.includes("pre-wedding")) key = "pre-wedding";
        else if (slug.includes("baby") || slug.includes("toddler") || slug.includes("newborn")) key = "baby";
        else if (slug.includes("wedding")) key = "wedding";
        else if (slug.includes("engagement")) key = "engagement";
        
        if (json.categoryGalleries && json.categoryGalleries[key]) {
          categoryImages = json.categoryGalleries[key].images || [];
        }
      }
    }
  } catch (err) {
    console.error("Error reading category data:", err);
  }
  
  return categoryImages;
}

interface GalleryAlbum {
  id: string;
  title: string;
  coverImage: string;
  images: string[];
  photoCount: number;
}

// Helper to get all matching gallery directories for a category slug without cross-contamination
function getMatchingDirs(slug: string): string[] {
  const galleryBaseDir = path.join(process.cwd(), "public", "img", "gallery");
  if (!fs.existsSync(galleryBaseDir)) return [];

  const normSlug = slug.toLowerCase().replace(/[^a-z0-9]/g, "");
  const dirs = fs.readdirSync(galleryBaseDir);

  // Exact match first
  const exactMatches = dirs.filter(d => d.toLowerCase().replace(/[^a-z0-9]/g, "") === normSlug);
  if (exactMatches.length > 0) return exactMatches;

  // Smart fuzzy matching with category guard filters
  return dirs.filter(d => {
    const normDir = d.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (normSlug === "wedding" && normDir.includes("prewedding")) return false;
    if (normSlug === "baby" && (normDir.includes("maternity") || normDir.includes("prebaby"))) return false;
    return normDir.includes(normSlug) || normSlug.includes(normDir);
  });
}

// In-memory cache for ultra-fast page loads
const folderCache = new Map<string, string[]>();

// Helper to scan public gallery folder for images dynamically
function scanGalleryFolder(slug: string): string[] {
  if (folderCache.has(slug)) return folderCache.get(slug)!;

  const galleryBaseDir = path.join(process.cwd(), "public", "img", "gallery");
  if (!fs.existsSync(galleryBaseDir)) return [];

  try {
    const matchedDirs = getMatchingDirs(slug);
    let results: string[] = [];

    const collectFiles = (dir: string): string[] => {
      let files: string[] = [];
      const list = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of list) {
        const resPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          files = files.concat(collectFiles(resPath));
        } else if (entry.isFile() && /\.(jpg|jpeg|png|webp|gif)$/i.test(entry.name)) {
          const relativePath = path.relative(path.join(process.cwd(), "public"), resPath);
          const webUrl = "/" + relativePath.split(path.sep).join("/");
          files.push(webUrl);
        }
      }
      return files;
    };

    for (const matchedDir of matchedDirs) {
      const targetDir = path.join(galleryBaseDir, matchedDir);
      results = results.concat(collectFiles(targetDir));
    }

    const finalResults = Array.from(new Set(results));
    folderCache.set(slug, finalResults);
    return finalResults;
  } catch (err) {
    console.error("Error reading directory for slug " + slug + ":", err);
  }
  return [];
}

// In-memory cache for ultra-fast page loads
const albumsCache = new Map<string, GalleryAlbum[]>();

// Helper to scan gallery folders into Shoot Session Album Containers
function scanGalleryAlbums(slug: string): GalleryAlbum[] {
  if (albumsCache.has(slug)) return albumsCache.get(slug)!;

  const galleryBaseDir = path.join(process.cwd(), "public", "img", "gallery");
  if (!fs.existsSync(galleryBaseDir)) return [];

  try {
    const matchedDirs = getMatchingDirs(slug);
    if (matchedDirs.length === 0) return [];

    const albums: GalleryAlbum[] = [];
    
    // Dynamic label formatting per category
    const categoryTitle = slug
      .split("-")
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    const getWebUrlsInDir = (dir: string): string[] => {
      const list = fs.readdirSync(dir, { withFileTypes: true });
      const files: string[] = [];
      for (const item of list) {
        const itemPath = path.join(dir, item.name);
        if (item.isDirectory()) {
          files.push(...getWebUrlsInDir(itemPath));
        } else if (item.isFile() && /\.(jpg|jpeg|png|webp|gif)$/i.test(item.name)) {
          const relativePath = path.relative(path.join(process.cwd(), "public"), itemPath);
          files.push("/" + relativePath.split(path.sep).join("/"));
        }
      }
      return files;
    };

    for (const matchedDir of matchedDirs) {
      const targetDir = path.join(galleryBaseDir, matchedDir);
      const entries = fs.readdirSync(targetDir, { withFileTypes: true });

      const subDirs = entries.filter(e => e.isDirectory());
      const directFiles = entries.filter(e => e.isFile() && /\.(jpg|jpeg|png|webp|gif)$/i.test(e.name));

      if (subDirs.length > 0) {
        subDirs.sort((a, b) => {
          const numA = parseInt(a.name);
          const numB = parseInt(b.name);
          if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
          return a.name.localeCompare(b.name);
        });

        for (let i = 0; i < subDirs.length; i++) {
          const sDir = subDirs[i];
          const sPath = path.join(targetDir, sDir.name);
          const images = getWebUrlsInDir(sPath);
          if (images.length > 0) {
            albums.push({
              id: `${slug}-${matchedDir}-album-${sDir.name}`,
              title: `${categoryTitle} Shoot Session #${sDir.name}`,
              coverImage: images[0],
              images: images,
              photoCount: images.length
            });
          }
        }
      }

      if (directFiles.length > 0) {
        const directUrls = directFiles.map(f => {
          const relativePath = path.relative(path.join(process.cwd(), "public"), path.join(targetDir, f.name));
          return "/" + relativePath.split(path.sep).join("/");
        });

        const chunkSize = (slug === "theme" || slug === "themes" || slug === "eyara") ? 1 : 6;
        for (let i = 0; i < directUrls.length; i += chunkSize) {
          const chunk = directUrls.slice(i, i + chunkSize);
          const sessionIndex = albums.length + 1;
          albums.push({
            id: `${slug}-${matchedDir}-direct-${sessionIndex}`,
            title: `${categoryTitle} Shoot Session #${sessionIndex}`,
            coverImage: chunk[0],
            images: chunk,
            photoCount: chunk.length
          });
        }
      }
    }

    albumsCache.set(slug, albums);
    return albums;
  } catch (err) {
    console.error("Error scanning albums for slug " + slug + ":", err);
  }
  return [];
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;

  if (slug === "photo-frames") {
    redirect("/photo-frames");
  }



  const dbImages = await getCategoryData(slug);
  const localImages = scanGalleryFolder(slug);

  // Format title from slug
  const title = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // Map slugs to category details
  const serviceDetails: Record<
    string,
    { desc: string; banner: string; features: string[] }
  > = {
    "maternity-indoor": {
      desc: "An elegant, premium pregnancy photo session in our fully temperature-controlled indoor studio. Featuring access to 35+ imported designer maternity gowns, comfortable dressing rooms, and bespoke background sets.",
      banner: "/img/gallery/maternity-indoor/maternity-indoor-cover.jpeg",
      features: [
        "Access to 35+ Designer Maternity Gowns",
        "Fully setup indoor prop environments",
        "Comfortable private changing space",
        "Retouched premium layout edits",
        "Layflat digital album delivery",
      ],
    },
    "maternity-outdoor": {
      desc: "Scenic, glowing natural light maternity portraits. Shot around sunset at Pune’s most beautiful lakes, fields, and custom private farms.",
      banner: "/img/gallery/maternity-outdoor/1/SKO00321.JPG",
      features: [
        "Sunset golden hour timing sessions",
        "2 gown changes with stylist assistance",
        "High-definition raw frame conversions",
        "High-speed drone footage (reels setup)",
      ],
    },
    "baby-indoor": {
      desc: "Delightful baby indoor studio sessions. We maintain comfortable room temperatures, sterilize all props daily, and utilize organic wraps and premium outfits.",
      banner: "/img/gallery/baby-indoor/IMG_2457.JPG.jpeg",
      features: [
        "Fully organic wraps and safe setups",
        "Temperature-controlled studio floor",
        "Curated toddler prop themes",
        "15 high-retouch edits in 15 days",
      ],
    },
    "baby-outdoor": {
      desc: "Vibrant baby outdoor photography capturing playful giggles and steps amidst natural greenery, beautiful parks, and sunlit outdoor setups.",
      banner: "/img/gallery/baby-outdoor/1/SKO03266.JPG",
      features: [
        "Natural daylight shooting",
        "Fun child-friendly toys and props",
        "Candid sibling and family highlights",
        "High-res edited frames delivery",
      ],
    },
    "newborn": {
      desc: "Capturing the purest initial days of your newborn in safe wrapping styles. Our photographers are certified in baby handling and safety protocols.",
      banner: "/img/gallery/newborn/newborn-cover.jpeg",
      features: [
        "Certified newborn safety handlers",
        "Classic basket and nest themes",
        "Parent and baby sibling portrait captures",
        "Premium wooden frame prints",
      ],
    },
    "wedding-segment": {
      desc: "Award-winning, high-end wedding cinematography and documentary photography. We capture candid raw emotions and grand cinematic visuals.",
      banner: "/img/gallery/wedding/wedding-cover.jpg",
      features: [
        "Award-winning cinematic teasers (Nikon recipient)",
        "Premium layflat wooden bound albums",
        "High-fidelity raw photo downloads",
        "Dedicated wedding director & stylist",
      ],
    },
    "pre-wedding": {
      desc: "Capture your romantic journey and unique chemistry in custom setups and beautiful outdoor landscapes around Pune.",
      banner: "/img/gallery/pre-wedding/pre-wedding-cover.jpg",
      features: [
        "Multiple scenic location sets in Pune",
        "Stylist guidance & wardrobe coordination",
        "Instagram Reels & cinema cuts package",
        "Full-resolution digital delivery in 15 days",
      ],
    },
    "haldi": {
      desc: "Vibrant, laughter-filled frames and candid highlights captured during traditional haldi ceremonies.",
      banner: "/img/gallery/haldi/haldi-cover.jpg",
      features: [
        "Candid and high-speed motion photography",
        "Fine-art color tuning for yellow hues",
        "Digital proof download vault access",
        "Bespoke layout design edits",
      ],
    },
    "wedding": {
      desc: "Cinematic wedding photography and award-winning documentary storytelling of your sacred union.",
      banner: "/img/gallery/wedding/wedding-cover.jpg",
      features: [
        "Certified professional wedding photographers",
        "Premium layflat wooden-bound flush albums",
        "Full candid and traditional wedding coverage",
        "Fast-track delivery with raw frame vaults",
      ],
    },
    "photo-frames": {
      desc: "Handcrafted luxury photo frames available in premium wood, glossy acrylic, brushed metal, and canvas finishes. Tailored to your custom size requirements.",
      banner: "/images/frames-preview.jpg",
      features: [
        "Premium Wood, Acrylic & Canvas materials",
        "Custom sizes up to 24\"x36\" and collage layouts",
        "Matte, Glossy & Anti-glare UV glass finishes",
        "Fast local delivery across Pune & PCMC",
      ],
    },
    "theme": {
      desc: "Bespoke creative theme photography sessions. Featuring custom background sets, vibrant props, and conceptual storytelling setups.",
      banner: "/img/gallery/Themes/SK_00064.JPG",
      features: [
        "Bespoke prop & backdrop set styling",
        "Conceptual studio lighting and color tuning",
        "High-resolution retouched deliverables",
        "Layflat digital album options",
      ],
    },
    "themes": {
      desc: "Bespoke creative theme photography sessions. Featuring custom background sets, vibrant props, and conceptual storytelling setups.",
      banner: "/img/gallery/Themes/SK_00064.JPG",
      features: [
        "Bespoke prop & backdrop set styling",
        "Conceptual studio lighting and color tuning",
        "High-resolution retouched deliverables",
        "Layflat digital album options",
      ],
    },
    "eyara": {
      desc: "An exquisite, high-concept portfolio session showcasing Eyara in elegant studio and themed environments.",
      banner: "/img/gallery/Eyara/SK_09102 copy.jpg",
      features: [
        "High-fashion portraiture & styling",
        "Studio backdrop & outdoor lighting sets",
        "Retouched premium layout edits",
        "Layflat digital album delivery",
      ],
    },
  };

  const current = serviceDetails[slug] || {
    desc: `Bespoke photoshoot sessions capturing raw expressions and premium highlights for ${title}.`,
    banner: "/img/blog/s2.jpg",
    features: [
      "Bespoke prop set styling",
      "High-fidelity camera lighting setups",
      "Professional retouched conversions",
      "Online secure downloads portal",
    ],
  };

  const albums = slug === "eyara" ? [] : scanGalleryAlbums(slug);

  // Combine database images (uploaded by admin) and local images scanned from public folder
  const dbUrls = dbImages.map(i => i.url);
  const combinedImages = Array.from(new Set([...dbUrls, ...localImages]));

  const displayImages = combinedImages;

  return (
    <CategoryGalleryView
      title={title}
      description={current.desc}
      banner={current.banner}
      features={current.features}
      images={displayImages}
      albums={albums}
    />
  );
}
