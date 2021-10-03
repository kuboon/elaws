import {xmlParser} from '../../deps.ts'

export default async (_req: Request): Promise<Response> => {
  const xml = await fetch('https://elaws.e-gov.go.jp/api/1/lawlists/1').then(x=>x.text())
  const json = xmlParser.parse(xml)
  const json2 = json.DataRoot.ApplData.LawNameListInfo
  const text = json2.map(i => `https://elaws.kbn.one/${encodeURI(i.LawNo)}`).join('\n')
  return new Response(text, {
    headers: {
      "content-type": "text/plain",
      'Cache-Control': 's-maxage=3, stale-while-revalidate'
    },
  });
};
