/**
 * HTTP map loading strategy — fetches map IR from a base URL on demand.
 *
 * Browser-safe: uses the global `fetch()`. Suitable for browser bundles,
 * Cloudflare Workers, Deno, Bun. Node 18+ also has global fetch.
 *
 * Two-tier caching: in-memory (instant) + optional persistent via
 * localStorage (survives reloads). Set `cacheKeyPrefix` to enable.
 */
import type { LoadStrategy, SystemCode } from "./index.js";
export interface HttpStrategyOptions {
    /**
     * Base URL or function returning a URL for a given system code.
     * Defaults to `/maps/${code}.json` (works with the interscript.org
     * deployment).
     */
    readonly baseUrl?: string | ((code: SystemCode) => string);
    /**
     * Optional request init passed to fetch() (headers, mode, etc.).
     */
    readonly fetchInit?: RequestInit;
    /**
     * Persistent cache prefix. When set, fetched maps are stored in
     * localStorage so they survive page reloads. Disabled by default.
     */
    readonly cacheKeyPrefix?: string;
}
/**
 * Strategy that fetches map IR over HTTP on demand.
 *
 * Async: returns a Promise. Use `MapLoader.loadAsync()` or
 * `InterscriptRuntime.transliterate()` (which auto-awaits async
 * strategies when present).
 *
 * Caching:
 *   - In-memory: every fetched map stays in the loader's cache for
 *     the lifetime of the page/process.
 *   - Persistent: optional localStorage cache (set `cacheKeyPrefix`)
 *     so maps don't re-fetch on subsequent visits.
 */
export declare function httpStrategy(options?: HttpStrategyOptions): LoadStrategy;
//# sourceMappingURL=http-loader.d.ts.map