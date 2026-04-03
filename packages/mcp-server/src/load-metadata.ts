import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { ScaffoldUiMetadata } from "./types.js";

/**
 * Resolve metadata.json from the built package (dist/esm/generated) or source (src/generated) during development.
 */
export function loadMetadata(): ScaffoldUiMetadata {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    join(here, "generated", "metadata.json"),
    join(here, "..", "generated", "metadata.json"),
    join(here, "..", "..", "src", "generated", "metadata.json"),
  ];
  for (const p of candidates) {
    if (existsSync(p)) {
      return JSON.parse(readFileSync(p, "utf8")) as ScaffoldUiMetadata;
    }
  }
  throw new Error(
    "scaffold-ui MCP: metadata.json not found. Run `pnpm run extract` (or `pnpm build`) in packages/mcp-server.",
  );
}
