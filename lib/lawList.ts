import { xmlParser } from "../server_deps.ts";
import { LawItem } from "../types.ts";

export const lawListP = fetch("https://elaws.e-gov.go.jp/api/1/lawlists/1")
  .then((x) => x.text())
  .then((xml) =>
    xmlParser.parse(xml).DataRoot.ApplData.LawNameListInfo as LawItem[]
  );
