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
  const database = getDb();
  database
    .prepare("INSERT INTO queue (payload) VALUES (?)")
    .run(JSON.stringify(payload));
}

export function dequeue(limit: number = 10): Array<{ id: number; payload: object }> {
  const database = getDb();
  const rows = database
    .prepare("SELECT id, payload FROM queue ORDER BY id ASC LIMIT ?")
    .all(limit) as Array<{ id: number; payload: string }>;

  return rows.map((r) => ({ id: r.id, payload: JSON.parse(r.payload) }));
}

export function remove(id: number): void {
  const database = getDb();
  database.prepare("DELETE FROM queue WHERE id = ?").run(id);
}

export function incrementRetries(id: number): void {
  const database = getDb();
  database
    .prepare("UPDATE queue SET retries = retries + 1 WHERE id = ?")
    .run(id);
}

export function queueSize(): number {
  const database = getDb();
  const row = database.prepare("SELECT COUNT(*) as count FROM queue").get() as {
    count: number;
  };
  return row.count;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
