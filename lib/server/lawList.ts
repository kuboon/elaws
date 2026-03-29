import { xmlParser } from "./deps.ts";
import { LawItem } from "../types.ts";

let cached: LawItem[] | undefined;
export async function lawList() {
  if (!cached) {
    const xml = await fetch("https://elaws.e-gov.go.jp/api/1/lawlists/1").then(
      (x) => x.text(),
    );
    const parsed = xmlParser.parse(xml);
    if (!parsed) {
      console.error(xml.slice(0, 1000));
      throw new Error("Failed to parse law list");
    }
    cached = parsed.DataRoot.ApplData.LawNameListInfo.filter((x: unknown) =>
      x
    ) as LawItem[];
  }
  return cached;
}
