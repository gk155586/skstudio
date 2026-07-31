import fs from "fs";
import path from "path";

function getDataDir(): string {
  const candidates = [
    path.join(process.cwd(), "data"),
    path.join(process.cwd(), "..", "data"),
    path.resolve(process.cwd(), "data"),
    path.resolve("data")
  ];

  for (const dir of candidates) {
    try {
      if (fs.existsSync(dir)) return dir;
    } catch {}
  }

  const defaultDir = path.join(process.cwd(), "data");
  try {
    if (!fs.existsSync(defaultDir)) {
      fs.mkdirSync(defaultDir, { recursive: true });
    }
  } catch {}
  return defaultDir;
}

// In-memory read cache
const dbCache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_TTL = 500; // 500ms short Cache TTL for ultra fast live sync

// Promise-based serialization queue for concurrent writes
let writePromiseQueue = Promise.resolve();

export const atomicDb = {
  readJson(filename: string, defaultVal: any = []): any {
    const cacheKey = filename;
    const now = Date.now();

    // Return cached reference if TTL is valid
    if (dbCache[cacheKey] && (now - dbCache[cacheKey].timestamp < CACHE_TTL)) {
      return dbCache[cacheKey].data;
    }

    const dataDir = getDataDir();
    const filePath = path.join(dataDir, filename);

    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf8");
        const parsed = JSON.parse(raw || JSON.stringify(defaultVal));
        
        // Save to cache
        dbCache[cacheKey] = { data: parsed, timestamp: now };
        return parsed;
      }
    } catch (error) {
      console.error(`[AtomicDB] Failed to read file "${filename}":`, error);
    }

    return defaultVal;
  },

  async writeJson(filename: string, content: any): Promise<boolean> {
    const cacheKey = filename;

    // Immediately invalidate cache to prevent dirty reads during transaction queues
    delete dbCache[cacheKey];

    return new Promise<boolean>((resolve) => {
      writePromiseQueue = writePromiseQueue
        .then(async () => {
          try {
            const dataDir = getDataDir();
            if (!fs.existsSync(dataDir)) {
              fs.mkdirSync(dataDir, { recursive: true });
            }

            const filePath = path.join(dataDir, filename);
            const tempPath = filePath + `.tmp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

            // 1. Write to temporary file
            fs.writeFileSync(tempPath, JSON.stringify(content, null, 2), "utf8");
            
            // 2. Atomic rename (operating system guarantees atomic file replace)
            fs.renameSync(tempPath, filePath);

            // 3. Cache the fresh data structure
            dbCache[cacheKey] = { data: content, timestamp: Date.now() };
            resolve(true);
          } catch (error) {
            console.error(`[AtomicDB] Transaction write failed on "${filename}":`, error);
            resolve(false);
          }
        })
        .catch((error) => {
          console.error(`[AtomicDB] Queue error:`, error);
          resolve(false);
        });
    });
  }
};
