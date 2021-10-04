/// <reference lib="dom" />
// deno-lint-ignore-file no-explicit-any
/** @jsx h */
import { LawItem } from '../types.ts'
import {
  h,
  useState,
  Fragment,
  useEffect,
  IS_BROWSER,
  PageConfig
} from '../deps.ts'
import useDebouncedCallback from '../lib/useDebouncedCallback.ts'

declare namespace JSX {
  interface IntrinsicElements {
    List: void
    div: void
    script: void
  }
}

export const config: PageConfig = { runtimeJS: true }

export default function Home () {
  const items = [
    {name: '321CONSTITUTION', href: '憲法'},
    {name: '129AC0000000089', href: '民法'},
    {name: '132AC0000000048', href: '商法'},
    {name: '140AC0000000045', href: '刑法'},
    {name: '408AC0000000109', href: '民事訴訟法'},
    {name: '323AC0000000131', href: '刑事訴訟法'}
  ]
  return (
    <div>
      <h1>日本法令引用 URL</h1>
      <div id='popular'>
        <ul class='inline'>
          {items.map(x=>{
          <li>
            <a href={x.href}>{x.name}</a>
          </li>
          })}
        </ul>
      </div>
      <App />
      <script
        type='text/javascript'
        src='https://minmoji.ucda.jp/sealjs/https%3A__elaws.kbn.one'
      ></script>
    </div>
  )
}

const LongList = ({ list }: { list: LawItem[] }) => {
  const groups: Record<string, LawItem[]> = {}
  list.forEach(i => {
    const year = String(i.PromulgationDate).slice(0, 4)
    if (!groups[year]) groups[year] = []
    groups[year].push(i)
  })
  const onClick = (ev: Event) =>
    (ev.target! as Element).classList.toggle('collapse')
  return (
    <Fragment>
      {Object.keys(groups)
        .reverse()
        .map(k => (
          <li>
            <h2 class='collapse' onClick={onClick}>
              {k}
            </h2>
            <ul>
              <ShortList list={groups[k]} />
            </ul>
          </li>
        ))}
    </Fragment>
  )
}
const ShortList = ({ list }: { list: LawItem[] }) => (
  <Fragment>
    {list.map(i => (
      <li>
        <a href={i.LawId}>
          {i.PromulgationDate}: {i.LawName}
        </a>
      </li>
    ))}
  </Fragment>
)
const App = () => {
  const [fullList, setFullList] = useState([] as LawItem[])
  const [list, setList] = useState([] as LawItem[])
  const [text, setText] = useState('')
  const [textChanged] = useDebouncedCallback(setText, 1000)
  useEffect(() => {
    fetch('./api/list').then(x=>x.json()).then(x=>{setFullList(x);setList(x)})
  }, [])
  useEffect(() => {
    setList(
      fullList!.filter(
        i =>
          i.PromulgationDate.toString().includes(text) ||
          i.LawName.includes(text)
      )
    )
  }, [text])
  return (
    <Fragment>
      <p>
        絞り込み検索{' '}
        <input
          type='text'
          onChange={(e: any) => textChanged(e.target.value)}
          disabled={!IS_BROWSER}
        />
      </p>
      <p>件数: {list.length}</p>
      <ul class='list'>
        {list.length > 100 ? (
          <LongList list={list} />
        ) : (
          <ShortList list={list} />
        )}
      </ul>
    </Fragment>
  )
}
let fetchLawList: ()=>Promise<LawItem[]>
if (false) {
  fetchLawList = () => {
    const lawListP = new Promise<LawItem[]>(ok =>
      ok([{ LawId: 'lawid', PromulgationDate: 'aaa', LawName: 'name' }])
    )
    return lawListP
  }
} else {
  fetchLawList = async () => {
    //const {lawListP} = await import('../lib/lawList.ts')
    const lawListP = await new Promise<LawItem[]>(ok =>
      ok([{ LawId: 'lawid', PromulgationDate: 'aaa', LawName: 'name' }])
    )
    return lawListP
  }
}

/*
<title>日本法令引用 URL</title><meta property="og:title" content="日本法令引用 URL"><meta property="og:description" content="クリックで選択してかんたんシェア">
  <meta property="og:image" content="https://og.kbn.one/%23%20日本法令引用 URL%0Aクリックで選択してかんたんシェア.png?md=1"><meta name="twitter:card" content="summary"><meta name="twitter:title"><meta name="twitter:description">
    <meta name="twitter:image" content="https://og.kbn.one/%23%20日本法令引用 URL%0Aクリックで選択してかんたんシェア.png?md=1"><meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="icon" type="image/png" href="/favicon.56088456.png">
      <link rel="mask-icon" href="/favicon.e2a89832.svg" color="pink"><link rel="icon" type="image/svg+xml" href="/favicon.e2a89832.svg"></head><body>
</body>
*/
