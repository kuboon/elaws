/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

//import { start } from "https://raw.githubusercontent.com/lucacasonato/fresh/main/server.ts";
import { start } from "fresh/server.ts";
import routes from "./routes.gen.ts";

start(routes);
