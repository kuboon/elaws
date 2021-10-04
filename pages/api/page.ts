// deno-lint-ignore-file no-explicit-any
import { xmlParser, pug, jsonpath } from "../../server_deps.ts";

const baseUrl = "https://elaws.kbn.one";
// const blockElems = ["Part", "Chapter", "Section", "Article", "Paragraph", "Item", "Subitem1"]
const blockElems = ["Article", "Paragraph", "Item", "Subitem1"];
const page = pug.compileFile("data/page.pug", {});

type LawContent = any

class PathNotFound extends Error {}

function selectByPath(json: LawContent, path: string) {
  const query = ["$"];
  const a = path.split("-");
  if (a[0] === "s") {
    a.shift();
    query.push(
      `SupplProvision[?(@.@_AmendLawNum=="${decodeURIComponent(a.shift()!)}")]`,
    );
  } else {
    query.push("MainProvision");
  }
  a.forEach((v, i) => {
    if (v == "0") return;
    const name = blockElems[i];
    if (!name) throw PathNotFound;
    query.push(`${name}[?(@.@_Num=="${v}")]`);
  });
  const q = query.join("..");
  try {
    const ret = jsonpath.JSONPath().query(json, q);
    if (ret.length == 0) throw "PathNotFound";
    if (ret.length > 1) {
      console.error("path is not uniq", path, q, JSON.stringify(ret[2]));
    }
    return ret[0];
  } catch (e) {
    console.error("jsonpath error", e);
  }
}
function* searchJson(json: LawContent, key: string|null): Generator<any, void, void>{
  for (const k in json) {
    if (!key && k[0] == "@") continue;
    if (typeof json[k] === "object") yield* searchJson(json[k], key);
    else if (k == key || !key) yield json[k];
  }
}
function rootDescription(json: any) {
  if (json.EnactStatement) return getSentence(json.EnactStatement);
  if (json.Preamble) {
    return getSentence(json.Preamble);
  }
  return "";
}
function getSentence(json: LawContent) {
  const it = searchJson(json, null);
  let buf = "";
  let c = it.next();
  while (!c.done) {
    buf += (buf == "" ? "" : " ") + c.value;
    if (buf.length > 100) return buf;
    c = it.next();
  }
  return buf;
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
export default async (req: Request): Promise<Response> => {
  const url = new URL(req.url, baseUrl);
  const [lawNum, path] = url.pathname.split("/").slice(1);
  if (lawNum.startsWith("favicon")) {
    return new Response(null, {status: 404});
  }
  try {
    const apiUrl = "https://elaws.e-gov.go.jp/api/1/lawdata/" + lawNum;
    const xml = (await fetch(apiUrl).then(x=>x.text()));
    const fullJson = xmlParser.parse(xml, {
      textNodeName: "_text",
      ignoreAttributes: false,
      arrayMode: "strict",
    });
    if (fullJson.DataRoot[0].Result[0].Code[0] != 0) {
      return new Response(null, {status: 404});
    }
    const root = fullJson.DataRoot[0];
    const json = root.ApplData[0].LawFullText[0].Law[0].LawBody[0];
    let title = json.LawTitle[0];
    if (title._text) title = title._text[0];
    const source = lawNum[0] === "%"
      ? apiUrl
      : "https://elaws.e-gov.go.jp/document?lawid=" + lawNum;
    const headers: Record<string, string> = {}
    headers["Cache-Control"] = "s-maxage=60, stale-while-revalidate";
    if (!path || path === "") {
      const description = rootDescription(json);
      return new Response(
        page({
          url: `${baseUrl}/${lawNum}`,
          source,
          xml: xml.replace(/<([^>]+)\/>/g, "<$1></$1>"),
          title,
          description,
        }),
        headers
      )
    }
    const target = selectByPath(json, path);
    const description = target ? getSentence(target) : "";
    return new Response(
      page({
        url: `${baseUrl}/${lawNum}/${path}`,
        source,
        xmlUrl: apiUrl,
        title: title + articleNum(path),
        description,
      }),
      headers
    );
  } catch (e) {
    if (e === "PathNotFound") {
      const body = pug.renderFile("data/nopath.pug", { lawNum, path }, undefined)
      return new Response(body, {status: 404});
    } else if (e.name === "HTTPError") {
      return new Response(null, {status: 404});
    }
    console.error(JSON.stringify(e));
    throw e;
  }
}
