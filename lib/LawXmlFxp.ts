import { xmlParser } from "../server_deps.ts";
import { DomQuery, pathToArray } from "../lib/path.ts";

type JSONValue =
    | string
    | number
    | boolean
    | { [x: string]: JSONValue }
    | Array<JSONValue>;

function getSentence(json: JSONValue) {
  const str = (walk(json, {name: '_text'}) as string[])[0]
  return str.replaceAll(/\s+/g, " ");
}
function walk(json: JSONValue, q: DomQuery): JSONValue | undefined {
  if(Array.isArray(json)){
    for(const j of json){
      const ret = walk(j as JSONValue, q)
      if(ret) return ret
    }
  } else if(typeof(json)==='object'){
    for(const [key, val] of Object.entries(json)){
      if (key === q.name) {
        if(!q.key) return val
        if(Array.isArray(val)){
          for(const v of val){
            if(typeof(v) === 'object' && (v as any)['__' + q.key][0] === q.val){
              return v
            }
          }
        }
      }
      const ret = walk(val, q)
      if(ret) return ret
    }
  }
}
export default class LawXml {
  public dom: JSONValue;
  constructor(public readonly xml: string) {
    this.dom = xmlParser.parse(xml);
  }
  querySelector(qArr: DomQuery[]) {
    let json = this.dom
    for(const q of qArr){
      const ret = walk(json, q)
      if(!ret) return
      json = ret
    }
    return Array.isArray(json) ? json[0] : json;
  }
  isOk() {
    return this.querySelector([{name: 'Result'}, {name: 'Code'}]) === 0;
  }
  title() {
    return this.querySelector([{name: 'LawTitle'}]);
  }
  rootDescription() {
    const enact = this.querySelector([{name: 'EnactStatement'}]);
    if (enact) return getSentence(enact);
    const preamble = this.querySelector([{name: 'Preamble'}]);
    return preamble ? getSentence(preamble) : "";
  }
  getSentenceFrom(path: string) {
    const selector = pathToArray(path);
    const target = this.querySelector(selector);
    return target && getSentence(target);
  }
}
