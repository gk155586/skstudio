import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { atomicDb } from "@/app/lib/db";
import { sseHub } from "@/app/lib/sse";

export const dynamic = "force-dynamic";

const FRAMES_FILE = path.join(process.cwd(), "data", "frames.json");

// Helper to load frames
function loadFrames() {
  if (fs.existsSync(FRAMES_FILE)) {
    try {
      const content = fs.readFileSync(FRAMES_FILE, "utf8");
      return JSON.parse(content || "{}");
    } catch (err) {
      console.error("Error reading frames file:", err);
    }
  }
  return {};
}

// GET: Query frames with search, filtering, and pagination
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search")?.toLowerCase().trim();
    const category = searchParams.get("category");
    const material = searchParams.get("material");
    const color = searchParams.get("color");
    const orientation = searchParams.get("orientation");
    const size = searchParams.get("size");
    const sort = searchParams.get("sort") || "newest"; // 'newest' | 'price_asc' | 'price_desc' | 'name'
    
    // Badges filters
    const isFeatured = searchParams.get("isFeatured") === "true";
    const isPopular = searchParams.get("isPopular") === "true";
    const isBestSeller = searchParams.get("isBestSeller") === "true";
    const isNew = searchParams.get("isNew") === "true";

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const framesMap = loadFrames();
    let framesList = Object.values(framesMap) as any[];

    // Apply Search
    if (search) {
      framesList = framesList.filter(f => 
        f.name?.toLowerCase().includes(search) ||
        f.code?.toLowerCase().includes(search) ||
        f.description?.toLowerCase().includes(search)
      );
    }

    // Apply Category Filter
    if (category && category !== "all") {
      framesList = framesList.filter(f => f.category === category);
    }

    // Apply Other Filters
    if (material && material !== "all") {
      framesList = framesList.filter(f => f.material === material);
    }
    if (color && color !== "all") {
      framesList = framesList.filter(f => f.color === color);
    }
    if (orientation && orientation !== "all") {
      framesList = framesList.filter(f => f.orientation === orientation);
    }
    if (size && size !== "all") {
      framesList = framesList.filter(f => f.size === size);
    }

    // Badge Filters
    if (isFeatured) framesList = framesList.filter(f => f.isFeatured);
    if (isPopular) framesList = framesList.filter(f => f.isPopular);
    if (isBestSeller) framesList = framesList.filter(f => f.isBestSeller);
    if (isNew) framesList = framesList.filter(f => f.isNew);

    // Apply Sorting
    if (sort === "newest") {
      framesList.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } else if (sort === "price_asc") {
      framesList.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sort === "price_desc") {
      framesList.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sort === "name") {
      framesList.sort((a, b) => a.name.localeCompare(b.name));
    }

    const totalCount = framesList.length;
    const startIndex = (page - 1) * limit;
    const paginatedList = framesList.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
      frames: paginatedList
    });

  } catch (error: any) {
    console.error("GET frames API error:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
  }
}

// POST: Add new frame design
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, category, style, size, material, color, orientation, thickness, finish, description, recommendedSizes, price, discount, isFeatured, isPopular, isBestSeller, isNew, images } = body;

    if (!name || !category || !size || !material) {
      return NextResponse.json({ success: false, message: "Missing required parameters" }, { status: 400 });
    }

    const frames = loadFrames();
    const id = "frm-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);
    
    // Auto-generate code
    const count = Object.keys(frames).length + 1;
    const code = `SK-FR-${String(count).padStart(3, "0")}`;

    const newFrame = {
      id,
      code,
      name,
      category,
      style: style || "Classic Elegant",
      size,
      material,
      color: color || "Black",
      orientation: orientation || "Portrait",
      thickness: thickness || "1 inch",
      finish: finish || "Matte",
      description: description || "",
      recommendedSizes: recommendedSizes || [size],
      price: price || 0,
      discount: discount || 0,
      availability: true,
      isFeatured: !!isFeatured,
      isPopular: !!isPopular,
      isBestSeller: !!isBestSeller,
      isNew: !!isNew,
      images: images || [],
      createdAt: new Date().toISOString()
    };

    frames[id] = newFrame;
    await atomicDb.writeJson("frames.json", frames);

    // Broadcast SSE update
    sseHub.broadcast("data_changed", { type: "frames_updated" });

    return NextResponse.json({ success: true, message: "Frame added successfully", frame: newFrame });

  } catch (error: any) {
    console.error("POST frame API error:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
  }
}

// PUT: Edit frame details (supports single or bulk updates)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { ids, updates } = body; // For bulk: { ids: ["id1", "id2"], updates: { price: 2000, category: "Baby" } }
    const { id, frame } = body;     // For single: { id: "id1", frame: { name: "New Name", ... } }

    const frames = loadFrames();

    // 1. Bulk Update Logic
    if (ids && Array.isArray(ids) && updates) {
      ids.forEach((currId: string) => {
        if (frames[currId]) {
          frames[currId] = { ...frames[currId], ...updates };
        }
      });
      await atomicDb.writeJson("frames.json", frames);
      sseHub.broadcast("data_changed", { type: "frames_updated" });
      return NextResponse.json({ success: true, message: `Bulk updated ${ids.length} frames successfully` });
    }

    // 2. Single Update Logic
    if (id && frame) {
      if (!frames[id]) {
        return NextResponse.json({ success: false, message: "Frame not found" }, { status: 404 });
      }
      frames[id] = { ...frames[id], ...frame, updatedAt: new Date().toISOString() };
      await atomicDb.writeJson("frames.json", frames);
      sseHub.broadcast("data_changed", { type: "frames_updated" });
      return NextResponse.json({ success: true, message: "Frame updated successfully", frame: frames[id] });
    }

    return NextResponse.json({ success: false, message: "Invalid payload parameters" }, { status: 400 });

  } catch (error: any) {
    console.error("PUT frame API error:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Delete frames (supports single or bulk updates)
export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");
    const bulkIdsParam = searchParams.get("ids"); // comma-separated ids e.g. ids=id1,id2

    const frames = loadFrames();

    // 1. Bulk Delete Logic
    if (bulkIdsParam) {
      const idsToDelete = bulkIdsParam.split(",");
      let deletedCount = 0;
      idsToDelete.forEach((currId: string) => {
        if (frames[currId]) {
          delete frames[currId];
          deletedCount++;
        }
      });
      if (deletedCount > 0) {
        await atomicDb.writeJson("frames.json", frames);
        sseHub.broadcast("data_changed", { type: "frames_updated" });
      }
      return NextResponse.json({ success: true, message: `Bulk deleted ${deletedCount} frames successfully` });
    }

    // 2. Single Delete Logic
    if (id) {
      if (!frames[id]) {
        return NextResponse.json({ success: false, message: "Frame not found" }, { status: 404 });
      }
      delete frames[id];
      await atomicDb.writeJson("frames.json", frames);
      sseHub.broadcast("data_changed", { type: "frames_updated" });
      return NextResponse.json({ success: true, message: "Frame deleted successfully" });
    }

    return NextResponse.json({ success: false, message: "Missing frame ID parameter" }, { status: 400 });

  } catch (error: any) {
    console.error("DELETE frame API error:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
