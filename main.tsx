import * as routes from "./routes/mod.ts";

import { Hono } from "@hono/hono";
import { compress } from "@hono/hono/compress";
import { serveStatic } from "@hono/hono/deno";

const staticFile = (path: string) =>
  serveStatic({
    path,
    onFound: (_path, c) => c.header("Cache-Control", "public, max-age=86400"),
  });

const app = new Hono();
app.use(compress());
app.get("/", (c) => {
  c.header(
    "Cache-Control",
    "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
  );
  return c.html(<routes.Index />);
});
app.get("/style.css", staticFile("static/style.css"));
app.get("/list.mjs", staticFile("static/list.mjs"));
app.get("/favicon.svg", staticFile("static/favicon.svg"));
app.get("/robots.txt", staticFile("static/robots.txt"));
app.get("/sitemap.txt", routes.sitemap);

app.get("/page.js", staticFile("static/page.js"));
app.get("/:lawId{[0-9]{3}[0-9A-Z]{12}}/:path?", routes.lawDetail);
app.get("/:lawNo/:path?", routes.redirect);

Deno.serve(app.fetch).finished.then(() => {
  console.log("Server stopped.");
});
