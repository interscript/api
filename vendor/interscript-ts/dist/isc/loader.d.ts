/**
 * ISC loader strategy — fetches .isc source files and feeds them to the
 * ISC parser + converter, producing CompiledMap objects for the runtime.
 *
 *   configure({ strategies: [iscStrategy({ baseUrl: "/maps" })] })
 */
import type { LoadStrategy } from "../loader.js";
export interface IscStrategyOptions {
    /** Base URL for fetching .isc files, e.g. "/maps" */
    baseUrl: string;
    /** Fetch function (defaults to global fetch) */
    readonly fetchFn?: typeof fetch;
    /** Pre-loaded ISC sources: { "system-code": "isc source text" } */
    readonly bundled?: Record<string, string>;
}
export declare function iscStrategy(opts: IscStrategyOptions): LoadStrategy;
/**
 * Synchronous strategy for pre-loaded ISC sources.
 * Use in Node.js (read files from disk) or with bundled sources.
 */
export declare function iscBundledStrategy(sources: Record<string, string>): LoadStrategy;
//# sourceMappingURL=loader.d.ts.map