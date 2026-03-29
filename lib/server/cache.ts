import { LruCache } from "@std/cache";
const lru = new LruCache<string, string>(10);

export async function cachedFetch(url: string) {
  const cached = lru.get(url);
  if (cached) return cached;
  const xml = await fetch(url).then((x) => x.text());
  const val = xml.slice(`<?xml version="1.0" encoding="UTF-8"?>`.length);
  lru.set(url, val);
  console.log(Deno.memoryUsage());
  return val;
}
