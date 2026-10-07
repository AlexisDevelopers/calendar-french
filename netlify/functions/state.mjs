import { getStore } from "@netlify/blobs";

export default async (req) => {
  const store = getStore("calendario");

  if (req.method === "GET") {
    const done = (await store.get("tachados", { type: "json" })) || [];
    return Response.json({ done }, { headers: { "cache-control": "no-store" } });
  }

  if (req.method === "POST") {
    let body;
    try { body = await req.json(); } catch { return new Response("Bad request", { status: 400 }); }
    const pass = process.env.EDIT_PASSWORD;
    if (!pass || body.password !== pass) return new Response("No autorizado", { status: 401 });
    if (!Array.isArray(body.done)) return new Response("Bad request", { status: 400 });
    const clean = body.done.filter((n) => Number.isInteger(n) && n >= 6 && n <= 30);
    await store.setJSON("tachados", clean);
    return Response.json({ ok: true });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config = { path: "/api/state" };
