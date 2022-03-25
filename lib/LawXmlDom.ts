import { JSDOM } from "../server_deps.ts";
import { pathToSelector } from "../lib/path.ts";

function getSentence(elem: Element) {
  return elem.textContent?.replaceAll(/\s+/g, " ");
}
export default class LawXml {
  public dom: HTMLElement;
  constructor(public readonly xml: string) {
    this.dom = new JSDOM(xml).window.document;
  }
  isOk() {
    return this.dom.querySelector("Result code")?.textContent === "0";
  }
  title() {
    return this.dom.querySelector("LawTitle")?.textContent!;
  }
  rootDescription() {
    const dom = this.dom;
    const enact = dom.querySelector("EnactStatement");
    if (enact) return getSentence(enact);
    const preamble = dom.querySelector("Preamble");
    return preamble ? getSentence(preamble) : "";
  }
  getSentenceFrom(path: string) {
    const selector = pathToSelector(path);
    const target = this.dom.querySelector(selector);
    return target && getSentence(target);
  }
}
