import { NowRequest, NowResponse } from '@now/node'
import pug from 'pug'
import xmlParse from 'fast-xml-parser'
import jsonpath from 'jsonpath'
import got from 'got'

// const blockElems = ["Part", "Chapter", "Section", "Article", "Paragraph", "Item", "Subitem1"]
const blockElems = ["Article", "Paragraph", "Item", "Subitem1"]
const page = pug.compileFile('data/page.pug', {})

class PathNotFound extends Error {}

function xmlClose(xml: string) {
  return xml.replace(/<(.+)\/>/g, "<$1></$1>")
};
function selectByPath(json, path){
  if(!path || path == "") return
  let query = "$"
  path.split("-").forEach((v, i) => {
    if(v=="0") return
    const name = blockElems[i]
    if(!name) throw "PathNotFound"
    query += `..${name}[?(@.@_Num==${v})]`
  })
  const ret = jsonpath.query(json, query)
  if(ret.length == 0) throw "PathNotFound"
  return ret
};
function getSentence(json){
  return jsonpath.query(json, "$.._text").join(" ").slice(0,100)
}
export default async function(req: NowRequest, res: NowResponse) {
  const url = new URL(req.url, `http://${req.headers.host}`)
  const [lawNum, path] = url.pathname.split("/").slice(1)
  const source = "https://elaws.e-gov.go.jp/api/1/lawdata/" + lawNum
  const xml = (await got(source)).body
  const fullJson = xmlParse.parse(xml, {textNodeName : "_text", ignoreAttributes: false, arrayMode: "strict"})
  const json = fullJson.DataRoot[0].ApplData[0].LawFullText[0].Law[0].LawBody[0]
  const title = json.LawTitle[0]
  const main = json.MainProvision[0]
  try {
    const target = selectByPath(main, path)
    const sentence = target ? getSentence(target) : ""
    res.setHeader('Cache-Control', 's-maxage=3, stale-while-revalidate')
    res.send(page({url: `https://elaws.kbn.one/${lawNum}${path ? "/" + path : ""}`, source, xml: xmlClose(xml), title, sentence}))
  }catch(e){
    if(e != "PathNotFound") throw e;
    res.status(404)
    res.send(pug.renderFile("data/nopath.pug", {lawNum, path}))
  }
}
