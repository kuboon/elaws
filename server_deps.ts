export * from "fresh/server.ts";
export { default as jmespath } from "https://esm.sh/jmespath";
export { compile as pugCompile } from "https://esm.sh/pug?dev";
export { JSDOM } from "https://esm.sh/jsdom";

import { XMLParser } from "https://esm.sh/fast-xml-parser@4";
export const xmlParser = new XMLParser({
  textNodeName: "_text",
  ignoreAttributes: false,
  attributeNamePrefix: "__",
  isArray: () => true,
});
