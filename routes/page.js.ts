import { Handler } from "../server_deps.ts";
import { esbuild, denoPlugin } from "https://raw.githubusercontent.com/lucacasonato/fresh/main/src/server/deps.ts";

let esbuildInitalized: boolean | Promise<void> = false;
async function ensureEsbuildInialized() {
  if (esbuildInitalized === false) {
    if (Deno.run === undefined) {
      esbuildInitalized = esbuild.initialize({
        wasmURL: "https://unpkg.com/esbuild-wasm@0.14.39/esbuild.wasm",
        worker: false,
      });
    } else {
      esbuild.initialize({});
    }
    await esbuildInitalized;
    esbuildInitalized = true;
  } else if (esbuildInitalized instanceof Promise) {
    await esbuildInitalized;
  }
}
export const handler: Handler = async (_req, _ctx) => {
  const entryPoints: Record<string, string> = {
    "page": new URL("../lib/page.ts", import.meta.url).href,
  };
  const absWorkingDir = Deno.cwd();
  await ensureEsbuildInialized();
  const bundle = await esbuild.build({
    bundle: true,
    entryPoints,
    format: "esm",
    metafile: true,
    minify: false,
    outdir: ".",
    // This is requried to ensure the format of the outputFiles path is the same
    // between windows and linux
    absWorkingDir,
    outfile: "",
    platform: "neutral",
    plugins: [denoPlugin()],
    splitting: true,
    target: ["chrome96", "firefox95", "safari14"],
    treeShaking: true,
    write: false,
  });
  const headers: Record<string, string> = { "Content-Type": "text/javascript" };
  return new Response(bundle.outputFiles[0].text, { headers });
};
