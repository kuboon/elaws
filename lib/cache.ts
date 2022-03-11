import { create, LRU } from "https://deno.land/x/dcache/mod.ts";
const lru: LRU<string, string> = create(10);

export async function cachedFetch(url: string) {
  const cached = lru.get(url);
  if (cached) return cached;
  const xml = await fetch(url).then((x) => x.text());
  const val = xml.slice(`<?xml version="1.0" encoding="UTF-8"?>`.length);
  lru.set(url, val);
  return val;
}
