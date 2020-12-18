import { NowRequest, NowResponse } from '@now/node'
import xmlParse from 'fast-xml-parser'
import got from 'got'

const xmlP = got('https://elaws.e-gov.go.jp/api/1/lawlists/1')
export default async function (req: NowRequest, res: NowResponse) {
  const xml = await xmlP
  const json = xmlParse.parse(xml.body).DataRoot.ApplData.LawNameListInfo
  res.setHeader('Cache-Control', 's-maxage=3, stale-while-revalidate')
  res.json(json)
}
