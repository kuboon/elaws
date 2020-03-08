import { NowRequest, NowResponse } from '@now/node'
import xmlParse from 'fast-xml-parser'
import got from 'got'
import fs from "fs"

export default async function(req: NowRequest, res: NowResponse) {
  const xml = fs.readFileSync("data/index.xml").toString('utf8')
  // const xml = await got("https://elaws.e-gov.go.jp/api/1/lawlists/1")
  const json = xmlParse.parse(xml).DataRoot.ApplData.LawNameListInfo
  res.setHeader('Cache-Control', 's-maxage=3, stale-while-revalidate')
  res.json(json)
}
