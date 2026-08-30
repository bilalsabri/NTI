import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { rm } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

process.env.NODE_ENV = "test";
const { createServer } = await import("./server.js");

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, "data", "tasks.json");

let server;
let base;

before(async () => {
  await rm(DATA_FILE, { force: true });
  await new Promise((resolve) => {
    server = createServer().listen(0, () => {
      base = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await rm(DATA_FILE, { force: true });
});

test("health endpoint responds ok", async () => {
  const res = await fetch(`${base}/api/health`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, "ok");
});

test("create, list, update and delete a task", async () => {
  const created = await fetch(`${base}/api/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Write tests" }),
  }).then((r) => r.json());
  assert.equal(created.title, "Write tests");
  assert.equal(created.done, false);

  const list = await fetch(`${base}/api/tasks`).then((r) => r.json());
  assert.equal(list.length, 1);

  const updated = await fetch(`${base}/api/tasks/${created.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ done: true }),
  }).then((r) => r.json());
  assert.equal(updated.done, true);

  const del = await fetch(`${base}/api/tasks/${created.id}`, {
    method: "DELETE",
  });
  assert.equal(del.status, 204);

  const empty = await fetch(`${base}/api/tasks`).then((r) => r.json());
  assert.equal(empty.length, 0);
});

test("rejects empty task title", async () => {
  const res = await fetch(`${base}/api/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "   " }),
  });
  assert.equal(res.status, 400);
});
