import { lawList } from "../lib/lawList.ts";
import { Handler } from "../server_deps.ts";

export const handler: Handler = async (_ctx) => {
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
