import { compileStringAsync } from "npm:sass@1.72.0";

export const styleCss = async () => {
  const scss = await Deno.readTextFile("data/style.scss");
  const body = await compileStringAsync(scss);
  const headers = { "Content-Type": "text/css" };
  return new Response(body.css, { headers });
};
