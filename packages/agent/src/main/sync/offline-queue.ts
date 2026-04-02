import path from "path";
import fs from "fs";
import { app } from "electron";

// Load better-sqlite3 from native_modules (packaged) or node_modules (dev)
function loadSqlite() {
  const candidates = [
    path.join(__dirname, "..", "native_modules", "better-sqlite3"),
    path.join(process.resourcesPath || "", "app.asar.unpacked", "native_modules", "better-sqlite3"),
  ];

  // Dev mode
  try { return require("better-sqlite3"); } catch {}

  // Packaged mode — try native_modules paths
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return require(p);
    } catch {}
  }

  console.error("[offline-queue] better-sqlite3 not found, falling back to JSON queue");
  return null;
}

const BetterSqlite3 = loadSqlite();

let db: any = null;
let jsonQueue: Array<{ id: number; payload: object; retries: number }> = [];
let jsonNextId = 1;
let jsonPath: string | null = null;
const useSqlite = !!BetterSqlite3;

function getDb() {
  if (!useSqlite) return null;
  if (!db) {
    const dbPath = path.join(app.getPath("userData"), "offline-queue.db");
    db = new BetterSqlite3(dbPath);
    db.exec(`
      CREATE TABLE IF NOT EXISTS queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        payload TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        retries INTEGER DEFAULT 0
      )
    `);
    console.log("[offline-queue] Using SQLite at:", dbPath);
  }
  return db;
}

// JSON fallback
function getJsonPath() {
  if (!jsonPath) {
    jsonPath = path.join(app.getPath("userData"), "offline-queue.json");
    try {
      if (fs.existsSync(jsonPath)) {
        const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
        jsonQueue = data.queue || [];
        jsonNextId = data.nextId || 1;
      }
    } catch {}
  }
  return jsonPath;
}
function saveJson() {
  try { fs.writeFileSync(getJsonPath(), JSON.stringify({ queue: jsonQueue, nextId: jsonNextId })); } catch {}
}

export function enqueue(payload: object): void {
  if (useSqlite) {
    getDb().prepare("INSERT INTO queue (payload) VALUES (?)").run(JSON.stringify(payload));
  } else {
    jsonQueue.push({ id: jsonNextId++, payload, retries: 0 });
    saveJson();
  }
}

export function dequeue(limit: number = 10): Array<{ id: number; payload: object }> {
  if (useSqlite) {
    const rows = getDb().prepare("SELECT id, payload FROM queue ORDER BY id ASC LIMIT ?").all(limit) as any[];
    return rows.map((r: any) => ({ id: r.id, payload: JSON.parse(r.payload) }));
  }
  getJsonPath();
  return jsonQueue.slice(0, limit).map((i) => ({ id: i.id, payload: i.payload }));
}

export function remove(id: number): void {
  if (useSqlite) {
    getDb().prepare("DELETE FROM queue WHERE id = ?").run(id);
  } else {
    jsonQueue = jsonQueue.filter((i) => i.id !== id);
    saveJson();
  }
}

export function incrementRetries(id: number): void {
  if (useSqlite) {
    getDb().prepare("UPDATE queue SET retries = retries + 1 WHERE id = ?").run(id);
  } else {
    const item = jsonQueue.find((i) => i.id === id);
    if (item) item.retries++;
    saveJson();
  }
}

export function queueSize(): number {
  if (useSqlite) {
    return (getDb().prepare("SELECT COUNT(*) as count FROM queue").get() as any).count;
  }
  getJsonPath();
  return jsonQueue.length;
}

export function closeDb(): void {
  if (db) { db.close(); db = null; }
  if (!useSqlite) saveJson();
}
