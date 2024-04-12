/** @jsx jsx */
/** @jsxFrag Fragment */
import { lawList } from "./lawList.ts";
import { LawItem } from "../types.ts";

import { Fragment, jsx } from "hono/middleware.ts";

const LongList = ({ list }: { list: LawItem[] }) => {
  const groups: Record<string, LawItem[]> = {};
  list.forEach((i) => {
    const year = String(i.PromulgationDate).slice(0, 4);
    if (!groups[year]) groups[year] = [];
    groups[year].push(i);
  });
  return (
    <div id="list">
      {Object.keys(groups)
        .reverse()
        .map((k) => (
          <details>
            <summary>{k}</summary>
            <ul>
              <ShortList list={groups[k]} />
            </ul>
          </details>
        ))}
    </div>
  );
};
const ShortList = ({ list }: { list: LawItem[] }) => (
  <>
    {list.map((i) => (
      <li>
        <a href={i.LawId}>{i.PromulgationDate}: {i.LawName}</a>
      </li>
    ))}
  </>
);
export default async function LawList() {
  const list = await lawList();
  return (
    <>
      <p>
        絞り込み検索:
        <input id="query" type="text" />
      </p>
      <p>
        件数: <span id="listLength">{list.length}</span>
      </p>
      <LongList list={list} />
    </>
  );
}
