import { cachedFetch } from "../lib/server/cache.ts";
import LawXml from "../lib/server/LawXmlFxp.ts";
import { articleNum, baseUrl } from "./lawDetail.tsx";

import { type Context } from "@hono/hono";
import { html } from "@hono/hono/html";

// X Player Card の iframe 内で表示する条文ビュー。
// X の iframe は sandbox (allow-scripts allow-same-origin allow-popups
// allow-presentation) で、alert / form 送信は使えないため、JS なしで
// サーバー側で描画し、リンクは新しいタブで開く。
const frameAncestors =
  "frame-ancestors 'self' https://x.com https://*.x.com https://twitter.com https://*.twitter.com";

export const embed = async (c: Context, next: () => Promise<void>) => {
  const { lawId, path } = c.req.param();
  if (!lawId) return next();
  const apiUrl = "https://laws.e-gov.go.jp/api/1/lawdata/" + lawId;
  const lawXml = new LawXml(await cachedFetch(apiUrl));
  if (!lawXml.isOk()) return next();

  const lawTitle = lawXml.title() || "";
  const lines = path ? lawXml.getLinesFrom(path) : [lawXml.rootDescription()];
  if (!lines || lines.length === 0) return next();

  const canonical = path
    ? `${baseUrl}/${lawId}/${path}`
    : `${baseUrl}/${lawId}`;
  const heading = lawTitle + (path ? articleNum(path) : "");

  c.header("Content-Security-Policy", frameAncestors);
  c.header(
    "Cache-Control",
    "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
  );
  c.header("X-Robots-Tag", "noindex");
  return c.html(html`
    <!DOCTYPE html>
    <html lang="ja">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
        <link rel="canonical" href="${canonical}" />
        <title>${heading}</title>
        <style>
          :root { color-scheme: light dark; --color: #111; --bg: #fff; --sub: #666; --link: #06c; }
          @media (prefers-color-scheme: dark) {
            :root { --color: #eee; --bg: #111; --sub: #aaa; --link: #9bf; }
          }
          * { box-sizing: border-box; }
          html, body { margin: 0; height: 100%; }
          body {
            display: flex; flex-direction: column;
            font-family: "Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Noto Sans JP", sans-serif;
            color: var(--color); background: var(--bg);
            font-size: clamp(14px, 4vw, 18px); line-height: 1.7;
          }
          header { padding: 0.75em 1em 0.5em; border-bottom: 1px solid var(--sub); }
          h1 { margin: 0; font-size: 1.1em; line-height: 1.4; }
          main { flex: 1; overflow-y: auto; padding: 0.25em 1em; }
      main p { margin: 0.5em 0; }
          footer { padding: 0.5em 1em; border-top: 1px solid var(--sub); font-size: 0.85em; text-align: right; }
          a { color: var(--link); }
        </style>
      </head>
      <body>
        <header>
          <h1>${heading}</h1>
        </header>
        <main>${lines.map((l) => html`<p>${l}</p>`)}</main>
        <footer>
          <a href="${canonical}" target="_blank"
            rel="noopener noreferrer">日本法令引用URL で全文を見る</a>
        </footer>
      </body>
    </html>
  `);
};
