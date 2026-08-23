/**
 * Filesystem-based map loading strategies.
 *
 * SERVER-ONLY: requires `node:fs`, `node:url`, `node:path`. Don't import
 * this from browser bundles — use `bundledStrategy` from `./loaders.js`
 * instead, or pre-bundle the maps with Vite's `import.meta.glob`.
 *
 * The CLI and Node-side test helpers import from here. Browser-safe
 * helpers (`normaliseMap`, `bundledStrategy`) are re-exported so server
 * callers have a single import surface.
 */
import type { LoadStrategy } from "./index.js";
import { normaliseMap, bundledStrategy } from "./loaders.js";
export { normaliseMap, bundledStrategy };
/**
 * Load maps from a filesystem directory. Each map is `<systemCode>.json`.
 * Throws on filesystem errors but returns `undefined` if the specific
 * file doesn't exist (so other strategies can be tried).
 */
export declare function filesystemStrategy(mapsDir: string): LoadStrategy;
/**
 * Loader relative to a module URL — handy for test fixtures.
 */
export declare function relativeFilesystemStrategy(relativeTo: string, relativePath: string): LoadStrategy;
//# sourceMappingURL=loaders.node.d.ts.map