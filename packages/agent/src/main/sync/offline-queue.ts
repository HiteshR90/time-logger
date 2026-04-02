import path from "path";
import fs from "fs";
import { app } from "electron";

interface QueueItem {
  id: number;
  payload: object;
  retries: number;
  createdAt: string;
}

let queue: QueueItem[] = [];
let nextId = 1;
let filePath: string | null = null;

function getFilePath(): string {
  if (!filePath) {
    filePath = path.join(app.getPath("userData"), "offline-queue.json");
    load();
  }
  return filePath;
}

function load() {
  try {
    if (filePath && fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      queue = data.queue || [];
      nextId = data.nextId || 1;
    }
  } catch {
    queue = [];
    nextId = 1;
  }
}

function save() {
  try {
    getFilePath();
    fs.writeFileSync(filePath!, JSON.stringify({ queue, nextId }, null, 2));
  } catch (err) {
    console.error("[offline-queue] Failed to save:", err);
  }
}

export function enqueue(payload: object): void {
  getFilePath();
  queue.push({ id: nextId++, payload, retries: 0, createdAt: new Date().toISOString() });
  save();
}

export function dequeue(limit: number = 10): Array<{ id: number; payload: object }> {
  getFilePath();
  return queue.slice(0, limit).map((item) => ({ id: item.id, payload: item.payload }));
}

export function remove(id: number): void {
  queue = queue.filter((item) => item.id !== id);
  save();
}

export function incrementRetries(id: number): void {
  const item = queue.find((i) => i.id === id);
  if (item) item.retries++;
  save();
}

export function queueSize(): number {
  getFilePath();
  return queue.length;
}

export function closeDb(): void {
  save();
}
