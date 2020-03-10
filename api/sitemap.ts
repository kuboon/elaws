import { NowRequest, NowResponse } from '@now/node'
import xmlParse from 'fast-xml-parser'
import got from 'got'
const J2x = xmlParse.j2xParser

export default async function(req: NowRequest, res: NowResponse) {
  const xml = await got("https://elaws.e-gov.go.jp/api/1/lawlists/1")
  const json = xmlParse.parse(xml).DataRoot.ApplData.LawNameListInfo
  res.setHeader('Cache-Control', 's-maxage=3, stale-while-revalidate')
  res.setHeader('Content-Type', 'text/xml')
  const j2x = new J2x({
    ignoreAttributes: false,
    format: true
  })
  const sitemap = json.slice(0.10).map(i => ({
    loc: `https://elaws.kbn.one/${encodeURI(i.LawNo)}`,
    lastmod: "2020-03-11"
  }))
  res.end(j2x.parse({
    urlset: {
      "@_xmlns": "http://www.sitemaps.org/schemas/sitemap/0.9",
      url: sitemap,
      changefreq: "monthly"
    }
  }))
}
