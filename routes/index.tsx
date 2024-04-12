/** @jsx jsx */
/** @jsxFrag Fragment */

import LawList from "../lib/server/LawList.tsx";
import { Fragment, jsx } from "hono/middleware.ts";
import { html } from "hono/helper.ts";
import { head } from "../lib/server/htmlHead.ts";

export function Index() {
  const headTags = head({
    description: "クリックで選択してかんたんシェア",
    url: "https://elaws.kbn.one",
    image:
      "https://og.kbn.one/%23%20日本法令引用%20URL%0Aクリックで選択してかんたんシェア.png?md=1",
  });
  const items = [
    { href: "321CONSTITUTION", name: "憲法" },
    { href: "129AC0000000089", name: "民法" },
    { href: "132AC0000000048", name: "商法" },
    { href: "140AC0000000045", name: "刑法" },
    { href: "408AC0000000109", name: "民事訴訟法" },
    { href: "323AC0000000131", name: "刑事訴訟法" },
  ];
  const liElems = items.map((x) => (
    <li>
      <a href={x.href}>{x.name}</a>
    </li>
  ));

  return html`<!DOCTYPE html>
  <html lang="ja">
    <head>
      ${headTags}
      <script src="/list.mjs" type="module"></script>
    </head>
    <body>
    <h1>日本法令引用 URL</h1>
    <div id="popular">
      <ul class="inline">${liElems}</ul>
    </div>
    ${<LawList />}
  </body>
  </html>`;
}
