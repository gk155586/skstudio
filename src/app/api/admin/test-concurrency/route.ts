import { NextResponse } from "next/server";
import { atomicDb } from "@/app/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const testFilename = "concurrency_test.json";
    
    // Reset test database file
    await atomicDb.writeJson(testFilename, []);

    const operationsCount = 200;
    const promises = [];

    console.log(`[Concurrency Test] Starting ${operationsCount} parallel writes...`);
    const startTime = Date.now();

    for (let i = 0; i < operationsCount; i++) {
      promises.push((async (index) => {
        // Read, append, and write
        const currentData = atomicDb.readJson(testFilename, []);
        currentData.push({ id: index, val: `value-${index}`, timestamp: Date.now() });
        await atomicDb.writeJson(testFilename, currentData);
        
        // Fast read check
        const verifyData = atomicDb.readJson(testFilename, []);
        return verifyData.length;
      })(i));
    }

    // Execute all concurrently
    await Promise.all(promises);
    const duration = Date.now() - startTime;

    // Verify final state
    const finalData = atomicDb.readJson(testFilename, []);
    const isCorrupted = finalData.length !== operationsCount;

    return NextResponse.json({
      success: true,
      operationsAttempted: operationsCount,
      operationsConfirmed: finalData.length,
      isCorrupted,
      durationMs: duration,
      averageOpMs: parseFloat((duration / operationsCount).toFixed(3)),
      message: isCorrupted 
        ? "Failure: Data corruption detected. Items mismatched." 
        : "Success: Atomic read-cache and write locks successfully verified concurrency safety."
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
