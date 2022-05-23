import { BUILD_ID } from "https://raw.githubusercontent.com/lucacasonato/fresh/main/src/server/constants.ts";
import { denoPlugin, esbuild, toFileUrl } from "https://raw.githubusercontent.com/lucacasonato/fresh/main/src/server/deps.ts";
import { Island } from "https://raw.githubusercontent.com/lucacasonato/fresh/main/src/server/types.ts";

let esbuildInitalized: boolean | Promise<void> = false;
export async function ensureEsbuildInialized() {
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

export class Bundler {
  #islands: Island[];
  #cache: Map<string, Uint8Array> | Promise<void> | undefined = undefined;

  constructor(islands: Island[]) {
    this.#islands = islands;
  }

  async bundle() {
    const entryPoints: Record<string, string> = {
      "main": new URL("https://raw.githubusercontent.com/lucacasonato/fresh/main/src/runtime/main.ts", import.meta.url).href,
    };

    for (const island of this.#islands) {
      entryPoints[`island-${island.id}`] = island.url;
    }

    const absWorkingDir = Deno.cwd();
    await ensureEsbuildInialized();
    const bundle = await esbuild.build({
      bundle: true,
      define: { __FRSH_BUILD_ID: `"${BUILD_ID}"` },
      entryPoints,
      format: "esm",
      metafile: true,
      minify: true,
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
    // const metafileOutputs = bundle.metafile!.outputs;

    // for (const path in metafileOutputs) {
    //   const meta = metafileOutputs[path];
    //   const imports = meta.imports
    //     .filter(({ kind }) => kind === "import-statement")
    //     .map(({ path }) => `/${path}`);
    //   this.#preloads.set(`/${path}`, imports);
    // }

    const cache = new Map<string, Uint8Array>();
    const absDirUrlLength = toFileUrl(absWorkingDir).href.length;
    for (const file of bundle.outputFiles) {
      cache.set(
        toFileUrl(file.path).href.substring(absDirUrlLength),
        file.contents,
      );
    }
    this.#cache = cache;

    return;
  }

  async cache(): Promise<Map<string, Uint8Array>> {
    if (this.#cache === undefined) {
      this.#cache = this.bundle();
    }
    if (this.#cache instanceof Promise) {
      await this.#cache;
    }
    return this.#cache as Map<string, Uint8Array>;
  }

  async get(path: string): Promise<Uint8Array | null> {
    const cache = await this.cache();
    return cache.get(path) ?? null;
  }

  // getPreloads(path: string): string[] {
  //   return this.#preloads.get(path) ?? [];
  // }
}
