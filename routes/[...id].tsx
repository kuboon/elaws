/** @jsx h */
/** @jsxFrag Fragment */
import { cachedFetch } from "../lib/cache.ts";
import { pathToSelector } from "../lib/path.ts";
import { Handler, JSDOM, renderToString } from "../server_deps.ts";
import { Fragment, h, Head, PageConfig, PageProps } from "../client_deps.ts";

const baseUrl = "https://elaws.kbn.one";
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

type PageData = {
  url: string;
  source: string;
  xml?: string;
  xmlUrl?: string;
  title: string;
  description?: string;
};

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
  if (!path || path === "") {
    const description = rootDescription(dom);
    const rendered = render({
      url: `${baseUrl}/${lawNum}`,
      source,
      xml,
      title,
      description,
    });
    return rendered;
  }
  const selector = pathToSelector(path);
  const target = dom.querySelector(selector);
  if (target) {
    const description = getSentence(target);
    const rendered = render({
      url: `${baseUrl}/${lawNum}/${path}`,
      source,
      xmlUrl: apiUrl,
      title: title + articleNum(path),
      description,
    });
    return rendered;
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

function render(data: PageData) {
  const body = renderToString(Page(data), null, { xml: true, pretty: true });
  const headers: Record<string, string> = {};
  headers["content-type"] = "application/xhtml+xml;charset=UTF-8";
  return new Response(body, { headers });
}
function Page(data: PageData) {
  return (
    <html xmlns="http://www.w3.org/1999/xhtml" lang="ja">
      <head>
        <link rel="stylesheet" href="/style.css" />
        <title>{data.title} - 日本法令引用 URL</title>
        <meta property="og:site_name" content="日本法令引用 URL" />
        <meta property="og:title" content="日本国憲法 前文1" />
        <meta
          property="og:description"
          content={data.description}
        />
        <meta
          property="og:url"
          content={data.url}
        />
        <meta
          property="og:image"
          content="https://og.kbn.one/%23%20日本国憲法 前文1%0A 日本国民は、正当に選挙された国会における代表者を通じて行動し、われらとわれらの子孫のために、諸国民との協和による成果と、わが国全土にわたつて自由のもたらす恵沢を確保し、政府の行為によつて再び戦争の惨禍が起ることのないやうにすることを決意し、ここに主権が国民に存することを宣言し、この憲法を確定する。そもそも国政は、国民の厳粛な信託によるものであつて、その権威は国民に由来し、その権力は国民の代表者がこれを行使し、その福利は国民がこれを享受する。これは人類普遍の原理であり、この憲法は、かかる原理に基くものである。われらは、これに反する一切の憲法、法令及び詔勅を排除する。 .png?md=1"
        />
        <meta property="og:image:width" content="833" />
        <meta property="og:image:height" content="476" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="日本国憲法 前文1" />
        <meta
          name="twitter:description"
          content=" 日本国民は、正当に選挙された国会における代表者を通じて行動し、われらとわれらの子孫のために、諸国民との協和による成果と、わが国全土にわたつて自由のもたらす恵沢を確保し、政府の行為によつて再び戦争の惨禍が起ることのないやうにすることを決意し、ここに主権が国民に存することを宣言し、この憲法を確定する。そもそも国政は、国民の厳粛な信託によるものであつて、その権威は国民に由来し、その権力は国民の代表者がこれを行使し、その福利は国民がこれを享受する。これは人類普遍の原理であり、この憲法は、かかる原理に基くものである。われらは、これに反する一切の憲法、法令及び詔勅を排除する。 "
        />
        <meta
          name="twitter:image"
          content="https://og.kbn.one/%23%20日本国憲法 前文1%0A 日本国民は、正当に選挙された国会における代表者を通じて行動し、われらとわれらの子孫のために、諸国民との協和による成果と、わが国全土にわたつて自由のもたらす恵沢を確保し、政府の行為によつて再び戦争の惨禍が起ることのないやうにすることを決意し、ここに主権が国民に存することを宣言し、この憲法を確定する。そもそも国政は、国民の厳粛な信託によるものであつて、その権威は国民に由来し、その権力は国民の代表者がこれを行使し、その福利は国民がこれを享受する。これは人類普遍の原理であり、この憲法は、かかる原理に基くものである。われらは、これに反する一切の憲法、法令及び詔勅を排除する。 .png?md=1"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="mask-icon" href="/favicon.svg" color="pink" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <script src="/page.js" defer={true} />
      </head>
      <body>
        <header>
          <h1 id="title">
            <a href="/">日本法令引用URL</a>
          </h1>
          <a
            id="source"
            href={data.source}
          >
            原本へのリンク
          </a>
        </header>
        <div
          id="xml"
          data-xmlurl={data.xmlUrl}
          dangerouslySetInnerHTML={{ __html: data.xml! }}
        >
        </div>
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
    </html>
  );
}
export default function renderError(props: PageProps) {
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
        {props.data}
      </body>
    </html>
  );
}
export const config: PageConfig = {
  routeOverride: "/:id([^_].+)",
};
