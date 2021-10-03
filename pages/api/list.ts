import LawList from '../../lib/lawList.ts'
export default async (_req: Request): Promise<Response> => {
  await LawList
  return new Response(JSON.stringify(LawList), {
    headers: {
      "content-type": "application/json; charset=UTF-8",
      'Cache-Control': 's-maxage=3, stale-while-revalidate'
    },
  });
};
