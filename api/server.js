#!/usr/bin/env node

import { Hono } from "hono"
import { serve } from "@hono/node-server"
import { serveStatic } from "@hono/node-server/serve-static"
import { cors } from "hono/cors"
import { db } from "./db/connection.js";

const app = new Hono();
const PORT = 3000

app.use(
  "*",
  cors({
    origin: "http://localhost",
    allowMethods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS"
    ],
    allowHeaders: [
      "Content-Type"
    ]
  })
);

app.get("/todos", async (c) => {
  const [rows] = await db.query(
    "SELECT * FROM todos ORDER BY sort_order ASC"
  );
  return c.json(rows);
});

app.post("/todos", async (c) => {
  const body = await c.req.json();
  const [[{ next }]] = await db.query(
    "SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM todos"
  );
  await db.query(
    "INSERT INTO todos(text, sort_order) VALUES(?, ?)",
    [body.text, next]
  );
  return c.json({ message: "追加しました" });
});

// /todos/:id より先に登録しないと :id = "completed" にマッチしてしまう
app.delete("/todos/completed", async (c) => {
  await db.query("DELETE FROM todos WHERE completed = 1");
  return c.json({ message: "完了済みを削除しました" });
});

app.delete("/todos/:id", async (c) => {
  const id = Number(c.req.param("id"));
  await db.query("DELETE FROM todos WHERE id = ?", [id]);
  return c.json({ message: "削除しました" });
});

// /todos/:id より先に登録
app.put("/todos/reorder", async (c) => {
  const updates = await c.req.json();
  await Promise.all(
    updates.map(({ id, sort_order }) =>
      db.query("UPDATE todos SET sort_order = ? WHERE id = ?", [sort_order, id])
    )
  );
  return c.json({ message: "並び替えました" });
});

app.put("/todos/:id", async (c) => {
  const id = Number(c.req.param("id"));
  await db.query(
    `UPDATE todos
     SET completed = NOT completed,
         completed_at = CASE WHEN completed = 1 THEN NOW() ELSE NULL END
     WHERE id = ?`,
    [id]
  );
  return c.json({ message: "更新しました" });
});

app.patch("/todos/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  await db.query(
    "UPDATE todos SET text = ? WHERE id = ?",
    [body.text, id]
  );
  return c.json({ message: "編集しました" });
});

app.patch("/todos/:id/pickup", async (c) => {
  const id = Number(c.req.param("id"));
  await db.query(
    "UPDATE todos SET pickup = NOT pickup WHERE id = ?",
    [id]
  );
  return c.json({ message: "ピックアップを更新しました" });
});

app.use("/*", serveStatic({ root: "../public" }));

//起動
serve({
  fetch: app.fetch,
  port: PORT,
});
console.log(`Hono running on http://localhost:${PORT}`);
