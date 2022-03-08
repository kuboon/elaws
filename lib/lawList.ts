import { xmlParser } from "../server_deps.ts";
import { LawItem } from "./types.ts";

let cached: LawItem[] | undefined;
export async function lawList() {
  if (!cached) {
    const xml = await fetch("https://elaws.e-gov.go.jp/api/1/lawlists/1").then((
      x,
    ) => x.text());
    const parsed = xmlParser.parse(xml);
    cached = parsed.DataRoot[0].ApplData[0].LawNameListInfo as LawItem[];
  }
  return cached;
}
