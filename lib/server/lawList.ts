import { xmlParser } from "./deps.ts";
import { LawItem } from "../types.ts";

type LawListXml = {
  DataRoot: { ApplData: { LawNameListInfo: (LawItem | null)[] } };
};

let cached: LawItem[] | undefined;
export async function lawList() {
  if (!cached) {
    const xml = await fetch("https://laws.e-gov.go.jp/api/1/lawlists/1").then(
      (x) => x.text(),
    );
    const parsed = xmlParser.parse(xml) as unknown as Partial<LawListXml>;
    if (!parsed.DataRoot) {
      console.error(xml.slice(0, 1000));
      throw new Error("Failed to parse law list");
    }
    cached = parsed.DataRoot.ApplData.LawNameListInfo.filter(
      (x): x is LawItem => !!x,
    );
  }
  return cached;
}
