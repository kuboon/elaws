import {lawListP} from '../../lib/lawList.ts'
import { HandlerContext } from "fresh/src/server/types.ts";

export const handler = async (_ctx: HandlerContext): Promise<Response> => {
  const LawList = await lawListP
  return new Response(JSON.stringify(LawList), {
    headers: {
      "content-type": "application/json; charset=UTF-8",
      'Cache-Control': 's-maxage=3, stale-while-revalidate'
    },
  });
};
