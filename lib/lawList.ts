import { xmlParser } from "../server_deps.ts";
import { LawItem } from "./types.ts";

let cached: LawItem[] | undefined;
export async function lawList() {
  if (!cached) {
    const xml = await fetch("https://elaws.e-gov.go.jp/api/1/lawlists/1").then(
      (x) => x.text(),
    );
    const parsed = xmlParser.parse(xml);
    if(!parsed[1]) {
      console.error(xml.slice(0, 1000));
      throw new Error("Failed to parse law list");
    }
    cached = parsed[1].DataRoot[1].ApplData.map((x: any) => {
      const info = x.LawNameListInfo;
      if (!info) return;
      return {
        LawId: info[0].LawId[0]["#text"],
        LawName: info[1].LawName[0]["#text"],
        PromulgationDate: info[3].PromulgationDate[0]?.["#text"] || "",
      };
    }).filter((x: unknown) => x) as LawItem[];
  }
  return cached;
}
