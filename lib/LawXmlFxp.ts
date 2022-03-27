import { xmlParser } from "../server_deps.ts";
import { DomQuery, pathToArray } from "../lib/path.ts";

type JSONValue =
    | string
    | number
    | boolean
    | { [x: string]: JSONValue }
    | Array<JSONValue>;

function getSentence(json: JSONValue) {
  if(typeof(json)==='string') return json
  const all = [] as string[]
  walk(json, {name: '#text'}, all) as string
  const text = all.join(' ')
  return text.replaceAll(/\s+/g, " ");
}
function walk(json: JSONValue, q: DomQuery, all?: string[]): JSONValue | undefined {
  if(Array.isArray(json)){
    for(const j of json){
      const ret = walk(j as JSONValue, q, all)
      if(ret && !all) return ret
    }
  } else if(typeof(json)==='object'){
    for(const [key, val] of Object.entries(json)){
      if (key === q.name) {
        if(!q.key) {
          if(all && typeof val === 'string') {
            all.push(val)
            return
          }
          return val
        }
        if((json[':@'] as Record<string, string>)['@_' + q.key] === q.val){
          return val
        }
        return
      }
      const ret = walk(val, q, all)
      if(ret) return ret
    }
  }
}
export default class LawXml {
  public dom: JSONValue;
  constructor(public readonly xml: string) {
    this.dom = xmlParser.parse(xml)[0].DataRoot;
  }
  querySelector(qArr: DomQuery[]) {
    let json = this.dom
    for(const q of qArr){
      const ret = walk(json, q)
      if(!ret) return
      json = ret
    }
    return getSentence(json);
  }
  isOk() {
    return this.querySelector([{name: 'Result'}, {name: 'Code'}]) === '0';
  }
  title() {
    const t = this.querySelector([{name: 'LawTitle'}])
    return t && getSentence(t);
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
