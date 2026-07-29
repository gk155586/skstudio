import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { atomicDb } from "@/app/lib/db";
import { sseHub } from "@/app/lib/sse";

export const dynamic = "force-dynamic";

const GALLERIES_FILE = path.join(process.cwd(), "data", "galleries.json");

// Helper to load galleries
function loadGalleries() {
  if (fs.existsSync(GALLERIES_FILE)) {
    try {
      const content = fs.readFileSync(GALLERIES_FILE, "utf8");
      return JSON.parse(content || "{}");
    } catch (err) {
      console.error("Error reading galleries file:", err);
    }
  }
  return {};
}

// GET: List all galleries mapped to a client
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const clientEmail = searchParams.get("client")?.toLowerCase().trim();

    if (!clientEmail) {
      return NextResponse.json({ success: false, message: "Client parameter is required" }, { status: 400 });
    }

    const galleries = loadGalleries();
    const clientGalleries = Object.values(galleries)
      .filter((g: any) => g.clientEmail?.toLowerCase() === clientEmail)
      .map((g: any) => ({
        id: g.id,
        name: g.name || "Photography Session",
        token: g.token,
        filesCount: g.files?.length || 0,
        files: g.files || [],
        createdAt: g.createdAt || new Date().toISOString()
      }));

    return NextResponse.json({
      success: true,
      client: clientEmail,
      galleries: clientGalleries
    });

  } catch (error: any) {
    console.error("GET galleries error:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Delete a specific file from a gallery session
export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const galleryId = searchParams.get("galleryId");
    const fileId = searchParams.get("fileId");

    if (!galleryId || !fileId) {
      return NextResponse.json({ success: false, message: "galleryId and fileId are required" }, { status: 400 });
    }

    const galleries = loadGalleries();
    if (!galleries[galleryId]) {
      return NextResponse.json({ success: false, message: "Gallery session not found" }, { status: 404 });
    }

    const gallery = galleries[galleryId];
    const initialLength = gallery.files?.length || 0;
    gallery.files = (gallery.files || []).filter((f: any) => f.id !== fileId);

    if (gallery.files.length === initialLength) {
      return NextResponse.json({ success: false, message: "File not found in gallery session" }, { status: 404 });
    }

    await atomicDb.writeJson("galleries.json", galleries);
    
    // Broadcast the real-time event to update the user view instantly
    sseHub.broadcast("data_changed", { type: "storage_updated" });

    return NextResponse.json({
      success: true,
      message: "File deleted successfully from gallery session"
    });

  } catch (error: any) {
    console.error("DELETE gallery file error:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
  }
}

// POST: Create a brand new unique gallery entry (returns a separate unique link)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const clientEmail = body.client?.toLowerCase().trim();
    const galleryName = body.name?.trim() || "New Shoots Gallery";

    if (!clientEmail) {
      return NextResponse.json({ success: false, message: "Client parameter is required" }, { status: 400 });
    }

    const galleries = loadGalleries();
    const galleryId = "gal-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);
    const token = Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 8);

    const newGallery = {
      id: galleryId,
      name: galleryName,
      clientEmail: clientEmail,
      token: token,
      files: [],
      createdAt: new Date().toISOString()
    };

    galleries[galleryId] = newGallery;
    await atomicDb.writeJson("galleries.json", galleries);

    return NextResponse.json({
      success: true,
      message: "New gallery created successfully",
      gallery: {
        id: galleryId,
        name: galleryName,
        token: token,
        filesCount: 0,
        files: [],
        createdAt: newGallery.createdAt
      }
    });

  } catch (error: any) {
    console.error("POST create gallery error:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
