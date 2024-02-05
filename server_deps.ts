export * from "$fresh/server.ts";
export { renderToString } from "preact-render-to-string";
export { default as jmespath } from "https://esm.sh/jmespath@0.16.0";

import { XMLParser } from "https://esm.sh/fast-xml-parser@4.0.7?no-check";
export const xmlParser = new XMLParser({
  ignoreAttributes: false,
  isArray: () => true,
  preserveOrder: true,
  processEntities: false,
  parseAttributeValue: false,
  parseTagValue: false,
});
