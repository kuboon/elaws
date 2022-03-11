import { PageConfig } from "../fresh/src/runtime/types.ts";
import { cachedFetch } from "../lib/cache.ts";
import { pathToSelector } from "../lib/path.ts";
import { Handler, JSDOM, pugCompile } from "../server_deps.ts";

const baseUrl = "https://elaws.kbn.one";
const page = pugCompile(Deno.readTextFileSync("data/page.pug"), {});

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
  try {
    const apiUrl = "https://elaws.e-gov.go.jp/api/1/lawdata/" + lawNum;
    const xml = await cachedFetch(apiUrl);
    const dom = new JSDOM(xml).window.document;
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
    const description = target ? getSentence(target) : "";
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
  } catch (e) {
    if (e === "PathNotFound") {
      const body = pug.renderFile(
        "data/nopath.pug",
        { lawNum, path },
        undefined,
      );
      return new Response(body, { status: 404 });
    } else if (e.name === "HTTPError") {
      return new Response(null, { status: 404 });
    }
    console.error(JSON.stringify(e));
    throw e;
  }
};
export const config: PageConfig = {
  routeOverride: "/:id([^_].+)",
};
