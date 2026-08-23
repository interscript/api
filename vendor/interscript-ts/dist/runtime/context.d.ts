/**
 * Mutable execution context — passed through interpreter invocations.
 *
 * Holds the in-flight string, the active compiled map, and the alias
 * resolution cache. Pure data; mutation happens only via well-defined
 * helpers so behaviour stays predictable.
 */
import type { CompiledMap, Item } from "../types.js";
import type { MapLoader } from "../loader.js";
export declare class ExecutionContext {
    /** Current working string the interpreter is transforming. */
    current: string;
    /** Map currently being executed. */
    readonly map: CompiledMap;
    /** Optional loader — used to resolve run-rule dependencies. */
    private readonly loader;
    /** Lazily-resolved aliases. */
    private readonly aliasCache;
    /** Function cache so repeated function calls don't re-resolve. */
    readonly functions: CompiledMap["functions"];
    constructor(map: CompiledMap, initial: string, loader?: MapLoader);
    resolveAlias(name: string): Item | undefined;
    /**
     * Spawn a new context for a different map (used by `run` rule with docName).
     * Reuses the same loader; fresh alias cache.
     */
    withMap(map: CompiledMap): ExecutionContext;
    /**
     * Load a dependency map via the configured loader. Throws if no loader.
     */
    loadDependency(systemCode: string): CompiledMap;
}
//# sourceMappingURL=context.d.ts.map