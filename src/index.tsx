import { h, render, Component, Fragment } from 'preact';
import { useState } from 'preact/hooks';
import { useDebouncedCallback } from "use-debounce";
globalThis.h = h;

const LongList = ({list}) => {
  const groups = {}
  list.forEach(i => {
    const year = String(i.PromulgationDate).slice(0,4)
    if(!groups[year]) groups[year] = []
    groups[year].push(i)
  })
  const onClick = ev => ev.target.classList.toggle('collapse')
  return Object.keys(groups).reverse().map(k => 
    <li>
      <h2 class="collapse" onClick={onClick}>{k}</h2>
      <ul><ShortList list={groups[k]}/></ul>
    </li>
  )
)
const ShortList = ({list}) => (
  list.map((i: any) => 
    <li>
      <a href={i.LawNo}>{i.PromulgationDate}: {i.LawName}</a>
    </li>
  )
)
const App = ({ children, ...props }) => {
  const [text, setText] = useState("");
  const [textChanged] = useDebouncedCallback(setText, 1000);
  const list = props.list.filter(i => i.PromulgationDate.toString().includes(text) || i.LawName.includes(text))
  return (
    <Fragment>
    <p>絞り込み検索 <input type="text" onChange={e => textChanged(e.target.value)}/></p>
    <p>件数: {list.length}</p>
    <ul class="list">
      {list.length > 100 ? <LongList list={list}/> : <ShortList list={list}/> }
    </ul>
    </Fragment>
  );
}

window.addEventListener("load", async () => {
  const json = await fetch("/api/list").then(r=>r.json())
  render(<App list={json.reverse()}/>, document.getElementById('app'));
})
