/**
 * Map loader — resolves a system code to a compiled map.
 *
 * Strategy pattern: maps can be loaded from different sources. Each
 * strategy is a function `(systemCode) => CompiledMap | undefined`
 * (sync) or `Promise<CompiledMap | undefined>` (async). Loader
 * composes strategies in priority order.
 *
 * Async strategies (e.g. HTTP fetch) are tried after sync ones. If an
 * async strategy is needed, callers must use `loadAsync()` /
 * `transliterate()` will throw a `MapNotInCacheError` so the caller
 * can preload and retry.
 *
 * Adding a new source: add a function to the strategies list.
 * Existing strategies don't change (OCP).
 */
import type { CompiledMap, SystemCode } from "./types.js";
export type LoadStrategy = ((systemCode: SystemCode) => CompiledMap | undefined | Promise<CompiledMap | undefined>);
interface MapLoaderOptions {
    /** Called when a map is first loaded so the loader can track it. */
    readonly onLoaded?: (systemCode: SystemCode, map: CompiledMap) => void;
}
export declare class MapLoader {
    private readonly strategies;
    private readonly cache;
    /** Tracks everything we've EVER loaded (even after cache clear). */
    private readonly known;
    private readonly options;
    constructor(strategies: LoadStrategy[], options?: MapLoaderOptions);
    /**
     * Synchronous load. Returns the cached map or attempts sync
     * strategies. Throws MapNotFoundError if no sync strategy resolves
     * the code (use loadAsync for async strategies like HTTP).
     */
    load(systemCode: SystemCode): CompiledMap;
    /**
     * Async load. Tries every strategy in order, awaiting async ones.
     * Use this when the strategy set includes HTTP or other async loaders.
     */
    loadAsync(systemCode: SystemCode): Promise<CompiledMap>;
    /** Force-clear the in-memory cache (keeps `known` registry). */
    clear(): void;
    /** All system codes ever loaded. */
    loadedMaps(): readonly SystemCode[];
    /** Register a map directly (bypasses strategies). */
    register(systemCode: SystemCode, map: CompiledMap): void;
}
export {};
//# sourceMappingURL=loader.d.ts.map