import { lawList } from "../lib/server/lawList.ts";

export const sitemap = async () => {
  const text = (await lawList()).map((x) =>
    `https://elaws.kbn.one/${encodeURI(x.LawId)}`
  ).join("\n");
  return new Response(text, {
    headers: {
      "content-type": "text/plain",
      "Cache-Control": "s-maxage=3, stale-while-revalidate",
    },
  });
};
