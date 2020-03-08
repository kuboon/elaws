import { NowRequest, NowResponse } from '@now/node'
import pug from 'pug'
import xmlParse from 'fast-xml-parser'
import fs from 'fs'
import { createTrue } from 'typescript'

const blockElems = ["Part", "Chapter", "Article", "Paragraph", "Item", "Subitem1"]
const page = pug.compileFile('data/page.pug')

function xmlClose(xml: string) {
  return xml.replace(/<(.+)\/>/g, "<$1></$1>")
};
function selectByPath(json, pathname){
  const path = pathname.split("/")[2]
  if(!path || path == "") return
  let cursor = json
  path.split("-").forEach((v, i) => {
    const name = blockElems[i]
    const c2 = cursor[name]
    if(!c2) throw new Error(JSON.stringify([cursor, name]))
    cursor = c2.find(e => e["@_Num"] == v)
    if(!cursor) throw new Error(JSON.stringify([c2, name, v]))
  })
  return cursor
};
function getSentence(str, json){
  if(str.length > 100) return str;
  let text;
  Object.values(json).find(v => {
    if(typeof v == 'object'){
      text = v['#text']
      if (text) return true;
      str = getSentence(str, v)
    }
  })
  return text ? str + text + " " : str;
}
export default async function(req: NowRequest, res: NowResponse) {
  const url = new URL(req.url, `http://${req.headers.host}`)
  const xmlId = "417AC0000000086_20170401_428AC0000000062"
  const xml = fs.readFileSync(`data/xml/${xmlId}.xml`).toString('utf8')
  const json = xmlParse.parse(xml, {ignoreAttributes: false, arrayMode: "strict"}).Law[0].LawBody[0]
  const title = json.LawTitle[0]
  const main = json.MainProvision[0]
  console.log(url.pathname)
  const target = selectByPath(main, url.pathname)
  const sentence = target ? getSentence("", target) : ""
  res.setHeader('Cache-Control', 's-maxage=3, stale-while-revalidate')
  res.send(page({xml: xmlClose(xml), title, sentence}))
}
