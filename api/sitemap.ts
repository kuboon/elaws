import { NowRequest, NowResponse } from '@now/node'
import xmlParse from 'fast-xml-parser'
import got from 'got'

export default async function(req: NowRequest, res: NowResponse) {
  const xml = await got("https://elaws.e-gov.go.jp/api/1/lawlists/1")
  const json = xmlParse.parse(xml.body).DataRoot.ApplData.LawNameListInfo
  res.setHeader('Cache-Control', 's-maxage=3, stale-while-revalidate')
  res.setHeader('Content-Type', 'text/plain')
  res.end(json.map(i => `https://elaws.kbn.one/${encodeURI(i.LawNo)}`).join("\n"))
}
