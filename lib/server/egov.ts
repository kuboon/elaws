import { cachedFetch } from "./cache.ts";
import LawXml from "./LawXmlFxp.ts";

// 条文単位で取得できる e-Gov 法令 API v2 (elm パラメータ) を使い、
// 法令全文 (数 MB) を取得・パースせずに済ませる。
const v2 = (lawId: string, elm: string) =>
  `https://laws.e-gov.go.jp/api/2/law_data/${lawId}?elm=${elm}&response_format=xml`;
const v1Full = (lawId: string) =>
  "https://laws.e-gov.go.jp/api/1/lawdata/" + lawId;

/**
 * 本則のパス ("13-1-3" など) から、それを含む条を取る elm ("MainProvision-Article_13") を作る。
 * v2 API は elm で指定した要素だけを返すので、項・号は取得した条の中から探す
 * (同じ条の項・号でキャッシュも共有できる)。
 */
export function pathToElm(path: string): string | undefined {
  if (path === "0") return "Preamble";
  const a = path.split("-");
  if (a[0] === "s" || a.length > 4) return;
  if (!a.every((v) => /^[0-9][0-9_]*$/.test(v)) || a[0] === "0") return;
  return `MainProvision-Article_${a[0]}`;
}

async function fetchV2(lawId: string, elm: string) {
  const xml = await cachedFetch(v2(lawId, elm));
  return xml === null ? undefined : new LawXml(xml, "law_data_response");
}

/** path の指す部分を含む LawXml を返す。見つからなければ undefined */
export async function loadLaw(lawId: string, path?: string) {
  if (!path) {
    for (const elm of ["EnactStatement", "Preamble", "LawTitle"]) {
      const law = await fetchV2(lawId, elm);
      if (law) return law;
    }
    return;
  }
  const elm = pathToElm(path);
  if (elm) return await fetchV2(lawId, elm);
  // 附則など elm で表せないパスは全文を取得する
  const xml = await cachedFetch(v1Full(lawId));
  if (xml === null) return;
  const law = new LawXml(xml);
  return law.isOk() ? law : undefined;
}

export const lawDataUrl = v1Full;
