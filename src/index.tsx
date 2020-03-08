import { h, render, Component, Fragment } from 'preact';
import { useState } from 'preact/hooks';
import { useDebounce } from "use-debounce";
globalThis.h = h;

const App = ({ children, ...props }) => {
  const [text, setText] = useState("");
  const [value] = useDebounce(text, 1000);
  return (
    <Fragment>
    <h1>{document.title}</h1>
    絞り込み検索 <input type="text" onChange={e => setText(e.target.value)}/>
    <ul class="list">
    {props.list.filter(i => i.PromulgationDate.toString().includes(value) || i.LawName.includes(value)).map(i => (
      <li>
        <a href={i.LawNo}>
          {i.PromulgationDate}: {i.LawName}
        </a></li>
    ))}
    </ul>
    </Fragment>
  );
}

window.addEventListener("load", async () => {
  const json = await fetch("/api/list").then(r=>r.json())
  render(<App list={json.reverse()}/>, document.body);
})
