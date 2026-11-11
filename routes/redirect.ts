import { lawList } from "../lib/server/lawList.ts";
import { type Context } from "@hono/hono";

export const redirect = async (c: Context, next: () => Promise<void>) => {
  const params = c.req.param();
  const { lawNo, path } = params;
  // 法令番号は必ず日本語を含む。/wp-login.php などのスキャンで
  // 法令一覧 (数 MB) を取得しないよう、ASCII だけのパスは即 404。
  if (!/[^\p{ASCII}]/u.test(lawNo)) return next();
  const hit = (await lawList()).filter((x) => x.LawNo == lawNo);
  if (hit.length === 0) return next();
  const paths = ["", hit[0].LawId];
  if (path?.length > 0) paths.push(path);
  return c.redirect(paths.join("/"), 301);
};
