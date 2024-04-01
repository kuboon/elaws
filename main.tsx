/** @jsx jsx */
/** @jsxFrag Fragment */

import * as routes from "./routes/mod.ts";

import { bundle } from "https://deno.land/x/emit@0.38.2/mod.ts";
import { Hono } from "hono/mod.ts";
import { jsx, serveStatic } from "hono/middleware.ts";

const bundledJsResponse = (entryPoint: string) => () =>
  bundle(import.meta.resolve(entryPoint)).then(({ code }) => {
    const headers = { "Content-Type": "application/javascript" };
    return new Response(code, { headers });
  });

const app = new Hono();
app.get("/", (c) => c.html(<routes.Index />));
app.get("/style.css", routes.styleCss);
app.get(
  "/BIZUDPGothic-Regular.ttf",
  serveStatic({ path: "static/BIZUDPGothic-Regular.ttf" }),
);
app.get("/list.mjs", bundledJsResponse("./lib/client/list.ts"));
app.get("/favicon.:ext", serveStatic({ path: "static/favicon.svg" }));
app.get("/sitemap.txt", routes.sitemap);

app.get("/page.js", bundledJsResponse("./lib/client/page.ts"));
app.get("/:lawNum{[0-9]{3}[0-9A-Z]{12}}/:path?", routes.lawDetail);

Deno.serve(app.fetch).finished.then(() => {
  console.log("Server stopped.");
});
