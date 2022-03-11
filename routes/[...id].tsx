/** @jsx h */
/** @jsxFrag Fragment */
import { cachedFetch } from "../lib/cache.ts";
import { pathToSelector } from "../lib/path.ts";
import { Handler, JSDOM, pugCompile } from "../server_deps.ts";
import { Fragment, h, Head, PageConfig, PageProps } from "../client_deps.ts";

const baseUrl = "https://elaws.kbn.one";
let page: Function;
try {
  page = pugCompile(Deno.readTextFileSync("data/page.pug"), {});
} catch {
  page = () => {};
}

function rootDescription(dom: Document) {
  const enact = dom.querySelector("EnactStatement");
  if (enact) return getSentence(enact);
  const preamble = dom.querySelector("Preamble");
  return preamble ? getSentence(preamble) : "";
}
function getSentence(elem: Element) {
  return elem.textContent?.replaceAll(/\s+/g, " ");
}
function articleNum(path: string) {
  const a = path.split("-");
  // const kanji = "〇一二三四五六七八九"
  const fusoku = a[0] === "s" ? `附則(${decodeURIComponent(a[1])}) ` : null;
  if (fusoku) {
    a.shift();
    a.shift();
  }
  const jou = a[0] === "0" ? "前文" : `第${a[0]}条`;
  return ` ${fusoku || ""}${jou}${a[1] || ""}`;
}

export const handler: Handler = async (_req, ctx) => {
  const [lawNum, path] = ctx.params.id.split("/");
  if (lawNum.startsWith("favicon")) {
    return new Response(null, { status: 404 });
  }
  const apiUrl = "https://elaws.e-gov.go.jp/api/1/lawdata/" + lawNum;
  const xml = await cachedFetch(apiUrl);
  const dom = new JSDOM(xml).window.document;
  if (dom.querySelector("Result code").textContent !== "0") {
    return ctx.render(<p>ご指定の法律IDに該当がありません。</p>);
  }
  const title = dom.querySelector("LawTitle")?.textContent;
  const source = lawNum[0] === "%"
    ? apiUrl
    : "https://elaws.e-gov.go.jp/document?lawid=" + lawNum;
  const headers: Record<string, string> = {};
  headers["Cache-Control"] = "s-maxage=3600, stale-while-revalidate";
  headers["Content-Type"] = "application/xhtml+xml;charset=UTF-8";
  if (!path || path === "") {
    const description = rootDescription(dom);
    return new Response(
      page({
        url: `${baseUrl}/${lawNum}`,
        source,
        xml,
        title,
        description,
      }),
      { headers },
    );
  }
  const selector = pathToSelector(path);
  const target = dom.querySelector(selector);
  if (target) {
    const description = getSentence(target);
    return new Response(
      page({
        url: `${baseUrl}/${lawNum}/${path}`,
        source,
        xmlUrl: apiUrl,
        title: title + articleNum(path),
        description,
      }),
      { headers },
    );
  }
  const a = path.split("-");
  const list = a.map((_, i) => {
    const href = `/${lawNum}/${a.slice(0, i).join("-")}`;
    return (
      <li>
        <a href={href}>{href}</a>
      </li>
    );
  });
  return ctx.render(
    <>
      <p>以下をお試しください。</p>
      <ul>{list}</ul>
    </>,
  );
};

export default function renderError({ data }: PageProps) {
  return (
    <html lang="ja">
      <head>
        <link rel="stylesheet" href="/style.css" />
        <title>Not Found - 日本法令引用 URL</title>
      </head>
      <body>
        <header>
          <h1 id="title">
            <a href="/">日本法令引用URL</a>
          </h1>
        </header>
        <h2>404 URLに誤りがあるようです</h2>
        {data}
      </body>
    </html>
  );
}
export const config: PageConfig = {
  routeOverride: "/:id([^_].+)",
};
