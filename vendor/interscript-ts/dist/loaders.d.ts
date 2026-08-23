/**
 * Map loading strategies — pluggable sources for compiled maps.
 *
 * Browser-safe: this module is safe to bundle into browsers. It only
 * exports `normaliseMap` (pure data) and `bundledStrategy` (works on
 * in-memory dictionaries). Filesystem strategies live in
 * `./loaders.node.ts` and pull in `node:fs` — that module is server-only.
 */
import type { CompiledMap, CompiledMapJson, LoadStrategy } from "./index.js";
/**
 * Convert raw JSON IR (as emitted by the Ruby compiler) into the runtime
 * CompiledMap shape. Reconstructs Map objects for aliases and functions.
 *
 * Single responsibility: shape normalisation. No I/O.
 */
export declare function normaliseMap(json: CompiledMapJson): CompiledMap;
/**
 * Load maps from a JSON dictionary bundled at build time. Useful for
 * browser bundles, tests, and any context where the maps are already
 * in memory.
 */
export declare function bundledStrategy(maps: Record<string, CompiledMapJson>): LoadStrategy;
//# sourceMappingURL=loaders.d.ts.map