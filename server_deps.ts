export * from "https://raw.githubusercontent.com/lucacasonato/fresh/main/server.ts";
export { renderToString } from "https://esm.sh/preact-render-to-string@5.1.20?deps=preact@10.6.6";
export { default as jmespath } from "https://esm.sh/jmespath";
export { JSDOM } from "https://esm.sh/jsdom";

import { XMLParser } from "https://esm.sh/fast-xml-parser@4";
export const xmlParser = new XMLParser({
  textNodeName: "_text",
  ignoreAttributes: false,
  attributeNamePrefix: "__",
  isArray: () => true,
});
