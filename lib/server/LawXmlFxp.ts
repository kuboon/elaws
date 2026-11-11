import { xmlParser } from "./deps.ts";
import { DomQuery, pathToArray } from "../path.ts";

type JSONValue =
  | string
  | number
  | boolean
  | null
  | { [x: string]: JSONValue }
  | Array<JSONValue>;
type JSONObject = { [x: string]: JSONValue };

// @libs/xml の parse 結果: 属性は "@Name"、テキストは "#text" または文字列値、
// 同名の子要素が複数あれば配列になる。
function getSentence(json: JSONValue | undefined) {
  const all: string[] = [];
  collectText(json, all);
  return all.join(" ").replaceAll(/\s+/g, " ").trim();
}
// 条・項・号ごとに改行を入れたテキスト
const blockNames = /^(Article|Paragraph|Item|Subitem\d+)$/;
function getLines(json: JSONValue | undefined) {
  const all: string[] = [];
  collectText(json, all, true);
  return all.join(" ").split("\n")
    .map((l) => l.replaceAll(/\s+/g, " ").trim())
    .filter((l) => l.length > 0);
}
function collectText(
  json: JSONValue | undefined,
  all: string[],
  lines = false,
) {
  if (json === null || json === undefined) return;
  if (typeof json !== "object") {
    all.push(String(json));
    return;
  }
  if (Array.isArray(json)) {
    for (const j of json) collectText(j, all, lines);
    return;
  }
  for (const [key, val] of Object.entries(json)) {
    if (key.startsWith("@") || key.startsWith("~")) continue;
    if (lines && blockNames.test(key)) {
      for (const v of Array.isArray(val) ? val : [val]) {
        all.push("\n");
        collectText(v, all, lines);
      }
      continue;
    }
    collectText(val, all, lines);
  }
}
function matches(val: JSONValue, q: DomQuery) {
  if (!q.key) return true;
  return typeof val === "object" && val !== null && !Array.isArray(val) &&
    String(val["@" + q.key]) === q.val;
}
// json 配下の q.name 要素を文書順に列挙する (見つかった要素の内側には潜らない)
function findAll(
  json: JSONValue,
  q: DomQuery,
  out: JSONValue[],
  limit: number,
) {
  if (out.length >= limit || json === null || typeof json !== "object") return;
  if (Array.isArray(json)) {
    for (const j of json) findAll(j, q, out, limit);
    return;
  }
  for (const [key, val] of Object.entries(json)) {
    if (key.startsWith("@")) continue;
    if (key === q.name) {
      for (const v of Array.isArray(val) ? val : [val]) {
        if (matches(v, q)) out.push(v);
        if (out.length >= limit) return;
      }
    } else {
      findAll(val, q, out, limit);
    }
    if (out.length >= limit) return;
  }
}
function find(json: JSONValue, q: DomQuery): JSONValue | undefined {
  const idx = q.idx ?? 0;
  const out: JSONValue[] = [];
  findAll(json, q, out, idx + 1);
  return out[idx];
}
export default class LawXml {
  public dom: JSONValue;
  constructor(public readonly xml: string, root = "DataRoot") {
    try {
      this.dom = (xmlParser.parse(xml) as JSONObject)[root];
    } catch (e) {
      console.error(xml.slice(0, 1000));
      throw e;
    }
  }
  find(qArr: DomQuery[]) {
    let json = this.dom;
    for (const q of qArr) {
      const ret = find(json, q);
      if (ret === undefined) return;
      json = ret;
    }
    return json;
  }
  querySelector(qArr: DomQuery[]) {
    let json = this.dom;
    for (const q of qArr) {
      const ret = find(json, q);
      if (ret === undefined) return;
      json = ret;
    }
    return getSentence(json);
  }
  isOk() {
    return this.querySelector([{ name: "Result" }, { name: "Code" }]) === "0";
  }
  title() {
    const t = this.querySelector([{ name: "LawTitle" }]) ||
      this.querySelector([{ name: "law_title" }]);
    return t && getSentence(t);
  }
  rootDescription() {
    const enact = this.querySelector([{ name: "EnactStatement" }]);
    if (enact) return getSentence(enact);
    const preamble = this.querySelector([{ name: "Preamble" }]);
    return preamble ? getSentence(preamble) : "";
  }
  getSentenceFrom(path: string) {
    if (path === "0") return this.querySelector([{ name: "Preamble" }]);
    const selector = pathToArray(path);
    const target = this.querySelector(selector);
    return target && getSentence(target);
  }
  /** getSentenceFrom と同じ箇所を、条・項・号ごとの行に分けて返す */
  getLinesFrom(path: string) {
    const target = this.find(
      path === "0" ? [{ name: "Preamble" }] : pathToArray(path),
    );
    return target === undefined ? undefined : getLines(target);
  }
}
