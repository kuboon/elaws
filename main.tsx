/** @jsx jsx */
/** @jsxFrag Fragment */

import * as routes from "./routes/mod.ts"

import { Hono } from "hono/mod.ts"
import { jsx, serveStatic } from 'hono/middleware.ts'
import * as esbuild from "https://deno.land/x/esbuild@v0.20.2/wasm.js";
import { denoPlugins } from "jsr:@luca/esbuild-deno-loader@^0.10.3";

async function bundle(entryPoint: string) {
  const result = await esbuild.build({
    plugins: [...denoPlugins()],
    entryPoints: [import.meta.resolve(entryPoint)],
    bundle: true,
    format: "esm",
  });
  return result.outputFiles![0].text;
}

const app = new Hono()

app.get('/', (c) => {
  return c.html(<routes.Index />)
})
app.get('/style.css', routes.styleCss)
app.get('/BIZUDPGothic-Regular.ttf', serveStatic({path: "static/BIZUDPGothic-Regular.ttf"}))
app.get('/list.mjs', async (c) => {
  const headers = { "Content-Type": "application/javascript" }
  return new Response(await bundle("./islands/list.ts"), { headers })
})
app.get('/favicon.:ext', serveStatic({path: "static/favicon.svg"}))
app.get('/sitemap.txt', routes.sitemap)

app.get('/page.js', async (c) => {
  const headers = { "Content-Type": "application/javascript" }
  return new Response(await bundle("./islands/page.ts"), { headers })
})
app.get('/:lawnum/:path?', (c) => {
  return routes.lawDetail(c, c.req.param('lawnum'), c.req.param('path'))
})
Deno.serve(app.fetch).finished.then(() => {
  console.log("Server stopped.")
  esbuild.stop();
})
