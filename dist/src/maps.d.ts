/**
 * Map delivery: the full corpus ships with the deploy as static assets
 * (minified JSON IR; the corpus gzips to ~21MB total). Assets are
 * immutable per release and served from the edge cache — bundled in the
 * Workers-idiomatic way, with no third-party fetch at runtime.
 *
 * Env contract: `env.ASSETS.fetch("/maps/<code>.json")` (Workers
 * Assets binding). Tests inject an equivalent object backed by the
 * local filesystem.
 */
import { type CompiledMap, type SystemCode } from "interscript";
export interface MapAssets {
    fetch(input: RequestInfo): Promise<Response>;
}
export declare function bundledSystemCodes(): readonly SystemCode[];
export declare function detectableSystemCodes(): readonly SystemCode[];
export declare function loadMap(assets: MapAssets, code: SystemCode): Promise<CompiledMap>;
