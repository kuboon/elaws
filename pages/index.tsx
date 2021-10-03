/// <reference lib="dom" />
// deno-lint-ignore-file no-explicit-any
/** @jsx h */
import {
  h,
  useState,
  Fragment,
  useEffect,
} from '../deps.ts'
import useDebouncedCallback from '../lib/useDebouncedCallback.ts'

declare namespace JSX {
  interface IntrinsicElements {
    List: void
    div: void
    script: void
    [key: string]: any
  }
}
type LawItem = { LawId: string; PromulgationDate: string; LawName: string }

export default function Home () {
  return (
    <div>
      <h1>日本法令引用 URL</h1>
      <div id='popular'>
        <ul class='inline'>
          <li>
            <a href='/321CONSTITUTION'>憲法</a>
          </li>
          <li>
            <a href='129AC0000000089'>民法</a>
          </li>
          <li>
            <a href='132AC0000000048'>商法</a>
          </li>
          <li>
            <a href='140AC0000000045'>刑法</a>
          </li>
          <li>
            <a href='408AC0000000109'>民事訴訟法</a>
          </li>
          <li>
            <a href='323AC0000000131'>刑事訴訟法</a>
          </li>
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
    setList(
      fullList.filter(
        i =>
          i.PromulgationDate.toString().includes(text) ||
          i.LawName.includes(text)
      )
    )
  }, [fullList, text])
  useEffect(() => {
    fetch('/api/list')
      .then(r => r.json())
      .then(r => {
        setFullList(r.reverse())
      })
  }, [])
  if (list.length == 0) {
    return <p>'loading'</p>
  }
  return (
    <Fragment>
      <p>
        絞り込み検索{' '}
        <input type='text' onChange={(e: any) => textChanged(e.target.value)} />
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

/*
<title>日本法令引用 URL</title><meta property="og:title" content="日本法令引用 URL"><meta property="og:description" content="クリックで選択してかんたんシェア">
  <meta property="og:image" content="https://og.kbn.one/%23%20日本法令引用 URL%0Aクリックで選択してかんたんシェア.png?md=1"><meta name="twitter:card" content="summary"><meta name="twitter:title"><meta name="twitter:description">
    <meta name="twitter:image" content="https://og.kbn.one/%23%20日本法令引用 URL%0Aクリックで選択してかんたんシェア.png?md=1"><meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="icon" type="image/png" href="/favicon.56088456.png">
      <link rel="mask-icon" href="/favicon.e2a89832.svg" color="pink"><link rel="icon" type="image/svg+xml" href="/favicon.e2a89832.svg"></head><body>
</body>
*/
