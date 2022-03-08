import { compile } from "https://x.nest.land/sass@2.0.0/mod.ts";
import { Handler } from "../server_deps.ts";

export const handler: Handler = async (_req, _ctx) => {
  const scss = await Deno.readTextFile("data/style.scss");
  const body = compile(scss);
  const headers: Record<string, string> = { "Content-Type": "text/css" };
  return new Response(body, { headers });
};
