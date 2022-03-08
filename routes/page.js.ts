import { Handler } from "../server_deps.ts";
import { esbuild } from "https://raw.githubusercontent.com/lucacasonato/fresh/main/src/server/deps.ts";

const absWorkingDir = Deno.cwd();
export const handler: Handler = async (_req, _ctx) => {
  const entryPoints: Record<string, string> = {
    "page": "lib/page.ts",
  };
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
    splitting: true,
    target: ["chrome96", "firefox95", "safari14"],
    treeShaking: true,
    write: false,
  });
  const headers: Record<string, string> = { "Content-Type": "text/javascript" };
  return new Response(bundle.outputFiles[0].text, { headers });
};
