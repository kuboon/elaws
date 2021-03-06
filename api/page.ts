import { NowRequest, NowResponse } from '@now/node'
import pug from 'pug'
import xmlParse from 'fast-xml-parser'
import jsonpath from 'jsonpath'
import got from 'got'
import fs from 'fs'

const baseUrl = 'https://elaws.kbn.one'
// const blockElems = ["Part", "Chapter", "Section", "Article", "Paragraph", "Item", "Subitem1"]
const blockElems = ['Article', 'Paragraph', 'Item', 'Subitem1']
const page = pug.compileFile('data/page.pug', {})

class PathNotFound extends Error {}

function selectByPath (json, path) {
  let query = ['$']
  const a = path.split('-')
  if (a[0] === 's') {
    a.shift()
    query.push(
      `SupplProvision[?(@.@_AmendLawNum=="${decodeURIComponent(a.shift())}")]`
    )
  } else {
    query.push('MainProvision')
  }
  a.forEach((v, i) => {
    if (v == '0') return
    const name = blockElems[i]
    if (!name) throw PathNotFound
    query.push(`${name}[?(@.@_Num=="${v}")]`)
  })
  const q = query.join('..')
  try {
    const ret = jsonpath.query(json, q)
    if (ret.length == 0) throw 'PathNotFound'
    if (ret.length > 1) console.error('path is not uniq', path, q, JSON.stringify(ret[2]))
    return ret[0]
  } catch (e) {
    console.error('jsonpath error', e)
  }
}
function * searchJson (json, key) {
  for (const k in json) {
    if (!key && k[0] == '@') continue
    if (typeof json[k] === 'object') yield * searchJson(json[k], key)
    else if (k == key || !key) yield json[k]
  }
}
function rootDescription (json) {
  if (json.EnactStatement) return getSentence(json.EnactStatement)
  if (json.Preamble) {
    return getSentence(json.Preamble)
  }
  return ''
}
function getSentence (json) {
  const it = searchJson(json, null)
  let buf = ''
  let c = it.next()
  while (!c.done) {
    buf += (buf == '' ? '' : ' ') + c.value
    if (buf.length > 100) return buf
    c = it.next()
  }
  return buf
}
function articleNum (path) {
  const a = path.split('-')
  // const kanji = "〇一二三四五六七八九"
  const fusoku = a[0] === 's' ? `附則(${decodeURIComponent(a[1])}) ` : null
  if (fusoku) {
    a.shift()
    a.shift()
  }
  const jou = a[0] === '0' ? '前文' : `第${a[0]}条`
  return ` ${fusoku || ''}${jou}${a[1] || ''}`
}
export default async function (req: NowRequest, res: NowResponse) {
  const url = new URL(req.url, `http://${req.headers.host}`)
  const [lawNum, path] = url.pathname.split('/').slice(1)
  if (lawNum.startsWith('favicon')) {
    res.status(404)
    res.end()
    return
  }
  try {
    const apiUrl = 'https://elaws.e-gov.go.jp/api/1/lawdata/' + lawNum
    const xml = (await got(apiUrl)).body
    const fullJson = xmlParse.parse(xml, {
      textNodeName: '_text',
      ignoreAttributes: false,
      arrayMode: 'strict'
    })
    if (fullJson.DataRoot[0].Result[0].Code[0] != 0) {
      res.status(404)
      res.end()
      return
    }
    const root = fullJson.DataRoot[0]
    const json = root.ApplData[0].LawFullText[0].Law[0].LawBody[0]
    let title = json.LawTitle[0]
    if(title._text) title = title._text[0]
    console.log(title)
    const source = lawNum[0] === '%' ? apiUrl : 'https://elaws.e-gov.go.jp/document?lawid=' + lawNum
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate')
    if (!path || path === '') {
      const description = rootDescription(json)
      res.send(
        page({ url: `${baseUrl}/${lawNum}`, source, xml: xml.replace(/<([^>]+)\/>/g, '<$1></$1>'), title, description })
      )
      return
    }
    const target = selectByPath(json, path)
    const description = target ? getSentence(target) : ''
    res.send(
      page({
        url: `${baseUrl}/${lawNum}/${path}`,
        source,
        xmlUrl: apiUrl,
        title: title + articleNum(path),
        description
      })
    )
  } catch (e) {
    if (e === 'PathNotFound') {
      res.status(404)
      res.send(pug.renderFile('data/nopath.pug', { lawNum, path }, null))
      return
    } else if (e.name === 'HTTPError') {
      res.status(404)
      res.end()
      return
    }
    console.error(JSON.stringify(e))
    throw e
  }
}
