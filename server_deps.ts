export * from "https://raw.githubusercontent.com/lucacasonato/fresh/main/server.ts";
export { renderToString } from "https://esm.sh/preact-render-to-string@5.1.20?deps=preact@10.6.6";
export { default as jmespath } from "https://esm.sh/jmespath";

import { XMLParser } from "https://esm.sh/fast-xml-parser@4?no-check";
export const xmlParser = new XMLParser({
  ignoreAttributes: false,
  isArray: () => true,
  preserveOrder: true,
  processEntities: false,
  parseAttributeValue: false,
  parseTagValue: false
});
