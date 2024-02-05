import { Handler } from "../server_deps.ts";
import { bundle } from "https://deno.land/x/emit/mod.ts"

export const handler: Handler = async (_req, _ctx) => {
  const url = import.meta.resolve("../lib/page.ts");
  const { code } = await bundle(url);
  const headers: Record<string, string> = { "Content-Type": "text/javascript" };
  return new Response(code, { headers });
};
