import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

function readJsonFile(filename: string, defaultValue: any) {
  try {
    const filePath = path.join(process.cwd(), "data", filename);
    if (!fs.existsSync(filePath)) {
      return defaultValue;
    }
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return defaultValue;
  }
}

export async function GET() {
  try {
    const content = readJsonFile("content.json", {});
    return NextResponse.json({ success: true, content });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
