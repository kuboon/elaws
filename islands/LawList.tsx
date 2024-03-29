import { LawItem } from "../lib/types.ts";
import { useEffect, useState } from "preact/hooks";
import useDebouncedCallback from "../lib/useDebouncedCallback.ts";

const LongList = ({ list }: { list: LawItem[] }) => {
  const groups: Record<string, LawItem[]> = {};
  list.forEach((i) => {
    const year = String(i.PromulgationDate).slice(0, 4);
    if (!groups[year]) groups[year] = [];
    groups[year].push(i);
  });
  const onClick = (ev: Event) =>
    (ev.target! as Element).classList.toggle("collapse");
  return (
    <>
      {Object.keys(groups)
        .reverse()
        .map((k) => (
          <li>
            <h2 class="collapse" onClick={onClick}>
              {k}
            </h2>
            <ul>
              <ShortList list={groups[k]} />
            </ul>
          </li>
        ))}
    </>
  );
};
const ShortList = ({ list }: { list: LawItem[] }) => (
  <>
    {list.map((i) => (
      <li>
        <a href={i.LawId}>
          {i.PromulgationDate}: {i.LawName}
        </a>
      </li>
    ))}
  </>
);
export default function LawList({ fullList }: { fullList: LawItem[] }) {
  const [list, setList] = useState(fullList);
  const [text, setText] = useState("");
  const [textChanged] = useDebouncedCallback(setText, 1000);
  useEffect(() => {
    setList(
      fullList!.filter(
        (i) =>
          i.PromulgationDate.toString().includes(text) ||
          i.LawName.includes(text),
      ),
    );
  }, [text]);
  return (
    <>
      <p>
        絞り込み検索{" "}
        <input
          type="text"
          onChange={(e) => textChanged((e.target as HTMLInputElement).value)}
        />
      </p>
      <p>件数: {list.length}</p>
      <ul class="list">
        {list.length > 100
          ? <LongList list={list} />
          : <ShortList list={list} />}
      </ul>
    </>
  );
}
