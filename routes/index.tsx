/// <reference lib="dom" />
/** @jsx h */
/** @jsxFrag Fragment */
import { Fragment, h, Head, PageProps } from "../client_deps.ts";
import LawList from "../islands/LawList.tsx";
import { lawList } from "../lib/lawList.ts";
import { LawItem } from "../lib/types.ts";
import { Handler } from "../server_deps.ts";

interface PageInfo {
  fullList: LawItem[];
}

export const handler: Handler<PageInfo> = async (_req, ctx) => {
  const data = { fullList: await lawList() };
  return ctx.render(data);
};
export default function Home(props: PageProps<PageInfo>) {
  const lawList: LawItem[] = props.data.fullList;
  const items = [
    { href: "321CONSTITUTION", name: "憲法" },
    { href: "129AC0000000089", name: "民法" },
    { href: "132AC0000000048", name: "商法" },
    { href: "140AC0000000045", name: "刑法" },
    { href: "408AC0000000109", name: "民事訴訟法" },
    { href: "323AC0000000131", name: "刑事訴訟法" },
  ];
  return (
    <>
      <Head>
        <title>日本法令引用 URL</title>
        <meta property="og:title" content="日本法令引用 URL" />
        <meta
          property="og:description"
          content="クリックで選択してかんたんシェア"
        />
        <meta
          property="og:image"
          content="https://og.kbn.one/%23%20日本法令引用 URL%0Aクリックで選択してかんたんシェア.png?md=1"
        />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" />
        <meta name="twitter:description" />
        <meta
          name="twitter:image"
          content="https://og.kbn.one/%23%20日本法令引用 URL%0Aクリックで選択してかんたんシェア.png?md=1"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/png" href="/favicon.56088456.png" />
        <link rel="mask-icon" href="/favicon.e2a89832.svg" />
        <link rel="icon" type="image/svg+xml" href="/favicon.e2a89832.svg" />
        <link rel="stylesheet" href="/style.css" />
      </Head>
      <h1>日本法令引用 URL</h1>
      <div id="popular">
        <ul class="inline">
          {items.map((x) => (
            <li>
              <a href={x.href}>{x.name}</a>
            </li>
          ))}
        </ul>
      </div>
      <LawList fullList={lawList} />
    </>
  );
}
