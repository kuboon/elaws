import { RenderContext, RenderFn } from "../server_deps.ts";

export function render(ctx: RenderContext, render: RenderFn) {
  ctx.lang = "ja";
  render();
}
