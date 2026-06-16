#!/usr/bin/env node

import { Hono } from "hono"
import { serve } from "@hono/node-server"
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
      "DELETE",
      "OPTIONS"
    ],
    allowHeaders: [
      "Content-Type"
    ]
  })
);

app.get("/todos",async (c) => {
	const[rows] =
		await db.query(
			"SELECT * FROM todos"
		);
	return c.json(rows);
});

app.post("/todos", async (c) => {
  const body = await c.req.json();
  await db.query(
    "INSERT INTO todos(text) VALUES(?)",
    [body.text]
  );
  return c.json({
    message: "追加しました"
  });
});


app.delete("/todos/:id", async (c) => {
  const id = Number(c.req.param("id"));
  await db.query(
    "DELETE FROM todos WHERE id = ?",
    [id]
  );
  return c.json({
    message: "削除しました"
  });
});


app.put("/todos/:id", async (c) => {
  const id = Number(c.req.param("id"));
  await db.query(
    `
    UPDATE todos
    SET completed = NOT completed
    WHERE id = ?
    `,
    [id]
  );
  return c.json({
    message: "更新しました"
  });
});

//DB
const [rows] = await db.query(
  "SELECT * FROM todos"
);
console.log(rows);


//起動
serve({
  fetch: app.fetch,
  port: PORT,
});
console.log(`Hono running on http://localhost:${PORT}`);
