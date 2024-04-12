/** @jsx jsx */
/** @jsxFrag Fragment */

import { lawList } from "../lib/server/lawList.ts";
import { type Context } from "hono/mod.ts";

export const redirect = async (c: Context, next: () => Promise<void>) => {
  const params = c.req.param();
  const { lawNo, path } = params;
  const hit = (await lawList()).filter((x) => x.LawNo == lawNo);
  if (hit.length === 0) return next();
  const paths = ["", hit[0].LawId];
  if (path.length > 0) paths.push(path);
  return c.redirect(paths.join("/"), 301);
};
