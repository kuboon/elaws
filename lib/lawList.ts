import * as xmlParser from 'https://cdn.pika.dev/fast-xml-parser@^3.17.3';

const xml = await fetch('https://elaws.e-gov.go.jp/api/1/lawlists/1').then(x=>x.text())
const json = xmlParser.parse(xml)
export default json.DataRoot.ApplData.LawNameListInfo
