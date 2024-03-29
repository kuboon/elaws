/** @jsx jsx */
/** @jsxFrag Fragment */

import * as routes from "./routes/mod.ts"

import { bundle } from "https://deno.land/x/emit@0.38.2/mod.ts"
import { Hono } from "hono/mod.ts"
import { jsx, serveStatic } from 'hono/middleware.ts'

async function bundleJs(entryPoint: string) {
  const { code } = await bundle(import.meta.resolve(entryPoint));
  return code
}

const app = new Hono()

app.get('/', (c) => {
  return c.html(<routes.Index />)
})
app.get('/style.css', routes.styleCss)
app.get('/BIZUDPGothic-Regular.ttf', serveStatic({path: "static/BIZUDPGothic-Regular.ttf"}))
app.get('/list.mjs', async (c) => {
  const headers = { "Content-Type": "application/javascript" }
  return new Response(await bundleJs("./islands/list.ts"), { headers })
})
app.get('/favicon.:ext', serveStatic({path: "static/favicon.svg"}))
app.get('/sitemap.txt', routes.sitemap)

app.get('/page.js', async (c) => {
  const headers = { "Content-Type": "application/javascript" }
  return new Response(await bundleJs("./islands/page.ts"), { headers })
})
app.get('/:lawnum/:path?', (c) => {
  return routes.lawDetail(c, c.req.param('lawnum'), c.req.param('path'))
})
Deno.serve(app.fetch).finished.then(() => {
  console.log("Server stopped.")
  esbuild.stop();
})
