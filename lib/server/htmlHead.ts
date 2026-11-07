import { html } from "@hono/hono/html";

export type Metas = {
  title?: string;
  description: string;
  url: string;
  image: string;
  /** X Player Card の iframe に読み込ませる URL (https の絶対 URL) */
  player?: string;
};
export const PLAYER_SIZE = 480;

export function head(metas: Metas) {
  const site_name = "日本法令引用 URL";
  const title = metas.title ? `${metas.title} - ${site_name}` : site_name;
  return html`
    <meta charset="utf-8" />
    <link rel="stylesheet" href="/style.css" />
    <title>${title}</title>
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${site_name}" />
    <meta property="og:title" content="${metas.title}" />
    <meta property="og:description" content="${metas.description}" />
    <meta property="og:url" content="${metas.url}" />
    <meta property="og:image" content="${metas.image}" />
    <meta property="og:image:width" content="833" />
    <meta property="og:image:height" content="476" />
    ${metas.player
      ? html`
        <meta name="twitter:card" content="player" />
        <meta name="twitter:player" content="${metas.player}" />
        <meta name="twitter:player:width" content="${PLAYER_SIZE}" />
        <meta name="twitter:player:height" content="${PLAYER_SIZE}" />
      `
      : html`<meta name="twitter:card" content="summary_large_image" />`}
    <meta name="twitter:title" content="${metas.title}" />
    <meta name="twitter:description" content="${metas.description}" />
    <meta name="twitter:image" content="${metas.image}" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="mask-icon" href="/favicon.svg" color="pink" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  `;
}
