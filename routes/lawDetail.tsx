/** @jsx jsx */
/** @jsxFrag Fragment */
import { cachedFetch } from "../lib/cache.ts";
import LawXml from "../lib/LawXmlFxp.ts";

import { type Context } from "hono/mod.ts";
import { Fragment, jsx } from "hono/middleware.ts";
import { html, raw } from "hono/helper.ts";

const baseUrl = "https://elaws.kbn.one";
function articleNum(path: string) {
  const a = path.split("-");
  // const kanji = "〇一二三四五六七八九"
  const fusoku = a[0] === "s" ? `附則(${decodeURIComponent(a[1])}) ` : null;
  if (fusoku) {
    a.shift();
    a.shift();
  }
  if (!a[0]) return "";
  const jou = a[0] === "0" ? "前文" : `第${a[0]}条`;
  return ` ${fusoku || ""}${jou}${a[1] || ""}`;
}

type PageData = {
  url: string;
  source: string;
  xml?: string;
  xmlUrl?: string;
  title: string;
  description?: string;
};

export const lawDetail = async (c: Context, next: () => Promise<void>) => {
  const params = c.req.param();
  const { lawNum, path } = params;
  if (!lawNum) return next();
  const apiUrl = "https://elaws.e-gov.go.jp/api/1/lawdata/" + lawNum;
  const xml = await cachedFetch(apiUrl);
  const lawXml = new LawXml(xml);
  if (!lawXml.isOk()) return next();

  const title = lawXml.title() || "";
  const source = lawNum[0] === "%"
    ? apiUrl
    : "https://elaws.e-gov.go.jp/document?lawid=" + lawNum;
  if (!path || path === "") {
    const description = lawXml.rootDescription();
    return render(c, {
      url: `${baseUrl}/${lawNum}`,
      source,
      xml,
      title,
      description,
    });
  }
  const description = lawXml.getSentenceFrom(path);
  if (description) {
    return render(c, {
      url: `${baseUrl}/${lawNum}/${path}`,
      source,
      xmlUrl: apiUrl,
      title: title + articleNum(path),
      description,
    });
  }
  const a = path.split("-");
  const list = a.map((_, i) => {
    const href = `/${lawNum}/${a.slice(0, i).join("-")}`;
    return (
      <li><a href={href}>{href}</a></li>
    );
  });
  return c.html(
    <>
      <p>以下をお試しください。</p>
      <ul>{list}</ul>
    </>, { status: 404 }
  );
};

function render(c: Context, data: PageData) {
  const headers = {
    "Content-Type": "application/xhtml+xml;charset=UTF-8",
    "Cache-Control": "s-maxage=3600, stale-while-revalidate"
  };
  return c.html(Page(data), 200, headers);
}
function Page(data: PageData) {
  const mrkdwn = `# ${data.title}\n${data.description}`;
  const og_image = `https://og.kbn.one/${encodeURIComponent(mrkdwn)}`;
  return html`<?xml version="1.0" encoding="UTF-8"?>
    <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="ja">
      <head>
        <link rel="stylesheet" href="/style.css" />
        <title>${data.title} - 日本法令引用 URL</title>
        <meta property="og:site_name" content="日本法令引用 URL" />
        <meta property="og:title" content="${data.title}" />
        <meta property="og:description" content="${data.description}" />
        <meta property="og:url" content="${data.url}" />
        <meta property="og:image" content="${og_image}" />
        <meta property="og:image:width" content="833" />
        <meta property="og:image:height" content="476" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${data.title}" />
        <meta name="twitter:description" content="${data.description}" />
        <meta name="twitter:image" content="${og_image}" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="mask-icon" href="/favicon.svg" color="pink" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body>
        <header>
          <h1 id="title">
            <a href="/">日本法令引用URL</a>
          </h1>
          <a id="source" href="${data.source}"> 原本へのリンク</a>
        </header>
        <xml id="xml" data-xmlurl="${data.xmlUrl}">${raw(data.xml || "")}</xml>
        <div id="share" style="display: none;">
          <svg
            fill="#000000"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="48px"
            height="48px"
          >
            <path d="M 15.990234 1.9902344 A 1.0001 1.0001 0 0 0 15.292969 3.7070312 L 17.585938 6 L 17 6 C 10.936593 6 6 10.936593 6 17 A 1.0001 1.0001 0 1 0 8 17 C 8 12.017407 12.017407 8 17 8 L 17.585938 8 L 15.292969 10.292969 A 1.0001 1.0001 0 1 0 16.707031 11.707031 L 20.707031 7.7070312 A 1.0001 1.0001 0 0 0 20.707031 6.2929688 L 16.707031 2.2929688 A 1.0001 1.0001 0 0 0 15.990234 1.9902344 z M 2.984375 7.9863281 A 1.0001 1.0001 0 0 0 2 9 L 2 19 C 2 20.64497 3.3550302 22 5 22 L 19 22 C 20.64497 22 22 20.64497 22 19 L 22 18 A 1.0001 1.0001 0 1 0 20 18 L 20 19 C 20 19.56503 19.56503 20 19 20 L 5 20 C 4.4349698 20 4 19.56503 4 19 L 4 9 A 1.0001 1.0001 0 0 0 2.984375 7.9863281 z" />
          </svg>
        </div>
      </body>
      <script src="/page.js"></script>
    </html>
  `;
}
