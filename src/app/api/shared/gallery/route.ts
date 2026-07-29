import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const GALLERIES_FILE = path.join(process.cwd(), "data", "galleries.json");

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const galleryId = searchParams.get("id");
    const clientEmail = searchParams.get("client")?.toLowerCase().trim();
    const secToken = searchParams.get("sec_token");

    if (!secToken) {
      return NextResponse.json({ success: false, message: "Security token is missing" }, { status: 400 });
    }

    if (!fs.existsSync(GALLERIES_FILE)) {
      return NextResponse.json({ success: false, message: "No galleries exist yet" }, { status: 404 });
    }

    const fileContent = fs.readFileSync(GALLERIES_FILE, "utf8");
    const galleries = JSON.parse(fileContent || "{}");

    let gallery: any = null;

    // 1. Direct lookup by unique Gallery ID (Preferred)
    if (galleryId && galleries[galleryId]) {
      gallery = galleries[galleryId];
    } 
    // 2. Fallback to client-email matching (Compatibility)
    else if (clientEmail) {
      gallery = Object.values(galleries).find((g: any) => g.clientEmail?.toLowerCase() === clientEmail);
    }

    if (!gallery) {
      return NextResponse.json({ success: false, message: "Requested gallery portfolio not found" }, { status: 404 });
    }

    // Security token validation
    if (gallery.token !== secToken) {
      return NextResponse.json({ success: false, message: "Unauthorized access: invalid token" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      id: gallery.id,
      name: gallery.name || "Photography Session",
      client: gallery.clientEmail,
      files: gallery.files || []
    });

  } catch (error: any) {
    console.error("Shared gallery query error:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
