import { lawListP } from "../lib/lawList.ts";
import { HandlerContext } from "fresh/src/server/types.ts";

export const handler = async (_ctx: HandlerContext): Promise<Response> => {
  const text = (await lawListP).map((x) =>
    `https://elaws.kbn.one/${encodeURI(x.LawId)}`
  ).join("\n");
  return new Response(text, {
    headers: {
      "content-type": "text/plain",
      "Cache-Control": "s-maxage=3, stale-while-revalidate",
    },
  });
};
