/** @jsx jsx */
/** @jsxFrag Fragment */

import * as routes from "./routes/mod.ts";

import { Hono } from "hono/mod.ts";
import { jsx, serveStatic } from "hono/middleware.ts";

const app = new Hono();
app.get("/", (c) => c.html(<routes.Index />));
app.get("/style.css", routes.styleCss);
app.get(
  "/BIZUDPGothic-Regular.ttf",
  serveStatic({ path: "static/BIZUDPGothic-Regular.ttf" }),
);
app.get("/list.mjs", serveStatic({ path: "static/list.mjs" }));
app.get("/favicon.:ext", serveStatic({ path: "static/favicon.svg" }));
app.get("/sitemap.txt", routes.sitemap);

app.get("/page.js", serveStatic({ path: "static/page.js" }));
app.get("/:lawId{[0-9]{3}[0-9A-Z]{12}}/:path?", routes.lawDetail);
app.get("/:lawNo/:path?", routes.redirect)

Deno.serve(app.fetch).finished.then(() => {
  console.log("Server stopped.");
});
