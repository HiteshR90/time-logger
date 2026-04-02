import Database from "better-sqlite3";
import path from "path";
import { app } from "electron";

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    const dbPath = path.join(app.getPath("userData"), "offline-queue.db");
    db = new Database(dbPath);
    db.exec(`
      CREATE TABLE IF NOT EXISTS queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        payload TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        retries INTEGER DEFAULT 0
      )
    `);
  }
  return db;
}

export function enqueue(payload: object): void {
  getDb().prepare("INSERT INTO queue (payload) VALUES (?)").run(JSON.stringify(payload));
}

export function dequeue(limit: number = 10): Array<{ id: number; payload: object }> {
  const rows = getDb()
    .prepare("SELECT id, payload FROM queue ORDER BY id ASC LIMIT ?")
    .all(limit) as Array<{ id: number; payload: string }>;
  return rows.map((r) => ({ id: r.id, payload: JSON.parse(r.payload) }));
}

export function remove(id: number): void {
  getDb().prepare("DELETE FROM queue WHERE id = ?").run(id);
}

export function incrementRetries(id: number): void {
  getDb().prepare("UPDATE queue SET retries = retries + 1 WHERE id = ?").run(id);
}

export function queueSize(): number {
  const row = getDb().prepare("SELECT COUNT(*) as count FROM queue").get() as { count: number };
  return row.count;
}

export function closeDb(): void {
  if (db) { db.close(); db = null; }
}
