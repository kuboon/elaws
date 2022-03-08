/// <reference lib="dom" />
/** @jsx h */
/** @jsxFrag Fragment */
import {
  h,
  Fragment,
  Head
} from '../client_deps.ts'
import LawList from "../islands/LawList.tsx";
import { xmlParse } from "../server_deps.ts";
import { LawItem } from "../lib/types.ts";

// const lawList = await fetch("https://elaws.e-gov.go.jp/api/1/lawlists/1")
//   .then((x) => x.text())
//   .then((xml) => {
//     return xmlParse(xml).DataRoot.ApplData.LawNameListInfo as LawItem[];
//   });
const lawList: LawItem[] = []

export default function Home () {
  const items = [
    {href: '321CONSTITUTION', name: '憲法' },
    {href: '129AC0000000089', name: '民法' },
    {href: '132AC0000000048', name: '商法' },
    {href: '140AC0000000045', name: '刑法' },
    {href: '408AC0000000109', name: '民事訴訟法' },
    {href: '323AC0000000131', name: '刑事訴訟法' }
  ]
  return (
    <>
      <Head>
        <title>日本法令引用 URL</title>
        <meta property='og:title' content='日本法令引用 URL' />
        <meta
          property='og:description'
          content='クリックで選択してかんたんシェア'
        />
        <meta
          property='og:image'
          content='https://og.kbn.one/%23%20日本法令引用 URL%0Aクリックで選択してかんたんシェア.png?md=1'
        />
        <meta name='twitter:card' content='summary' />
        <meta name='twitter:title' />
        <meta name='twitter:description' />
        <meta
          name='twitter:image'
          content='https://og.kbn.one/%23%20日本法令引用 URL%0Aクリックで選択してかんたんシェア.png?md=1'
        />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        <link rel='icon' type='image/png' href='/favicon.56088456.png' />
        <link rel='mask-icon' href='/favicon.e2a89832.svg' />
        <link rel='icon' type='image/svg+xml' href='/favicon.e2a89832.svg' />
      </Head>
      <h1>日本法令引用 URL</h1>
      <div id='popular'>
        <ul class='inline'>
          {items.map(x => (
            <li>
              <a href={x.href}>{x.name}</a>
            </li>
          ))}
        </ul>
      </div>
      <LawList fullList={lawList}/>
    </>
  )
}
