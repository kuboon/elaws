import { lawList } from "../lib/server/lawList.ts";

export const sitemap = async () => {
  const text = (await lawList()).map((x) =>
    `https://elaws.kbn.one/${encodeURI(x.LawId)}`
  ).join("\n");
  return new Response(text, {
    headers: {
      "content-type": "text/plain",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=86400",
    },
  });
};
