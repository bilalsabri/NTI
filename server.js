import express from "express";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "data");
const DATA_FILE = join(DATA_DIR, "tasks.json");
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

async function readTasks() {
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
}

async function writeTasks(tasks) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(tasks, null, 2));
}

const app = express();
app.use(express.json());
app.use(express.static(join(__dirname, "public")));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.get("/api/tasks", async (_req, res, next) => {
  try {
    res.json(await readTasks());
  } catch (err) {
    next(err);
  }
});

app.post("/api/tasks", async (req, res, next) => {
  try {
    const title = (req.body?.title ?? "").toString().trim();
    if (!title) {
      return res.status(400).json({ error: "title is required" });
    }
    const tasks = await readTasks();
    const task = {
      id: randomUUID(),
      title,
      done: false,
      createdAt: new Date().toISOString(),
    };
    tasks.push(task);
    await writeTasks(tasks);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

app.patch("/api/tasks/:id", async (req, res, next) => {
  try {
    const tasks = await readTasks();
    const task = tasks.find((t) => t.id === req.params.id);
    if (!task) return res.status(404).json({ error: "task not found" });
    if (typeof req.body?.done === "boolean") task.done = req.body.done;
    if (typeof req.body?.title === "string" && req.body.title.trim()) {
      task.title = req.body.title.trim();
    }
    await writeTasks(tasks);
    res.json(task);
  } catch (err) {
    next(err);
  }
});

app.delete("/api/tasks/:id", async (req, res, next) => {
  try {
    const tasks = await readTasks();
    const next_ = tasks.filter((t) => t.id !== req.params.id);
    if (next_.length === tasks.length) {
      return res.status(404).json({ error: "task not found" });
    }
    await writeTasks(next_);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "internal server error" });
});

export function createServer() {
  return app;
}

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, HOST, () => {
    console.log(`NTI task manager listening on http://${HOST}:${PORT}`);
  });
}

export default app;
