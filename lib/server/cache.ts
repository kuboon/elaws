import { LruCache } from "@std/cache";

// e-Gov API のレスポンスキャッシュ (isolate ごと)。
// 法令全文 XML は数 MB になるのでキャッシュせず、条文単位の小さな XML だけ保持する。
const MAX_CACHEABLE = 200_000;
const lru = new LruCache<string, string | null>(1000);
const xmlDecl = /^<\?xml[^>]*\?>/;

/** 200 以外は null を返す (null もキャッシュする) */
export async function cachedFetch(url: string): Promise<string | null> {
  if (lru.has(url)) return lru.get(url)!;
  const res = await fetch(url);
  const val = res.ok ? (await res.text()).replace(xmlDecl, "") : null;
  if (!res.ok) await res.body?.cancel();
  if (val === null || val.length < MAX_CACHEABLE) lru.set(url, val);
  return val;
}
