/**
 * models.yaml resolution (the dynamic-fetch contract shared with the
 * Python and Ruby runtimes): resolve id -> channel URL, verify a cached
 * copy against the index sha256, or download -> verify -> install.
 *
 * Node persists to ~/.cache/interscript/models/<id>/ (fs, atomic
 * rename); browsers keep the verified bytes in memory (the Cache API
 * integration is future work). Overrides: INTERSCRIPT_ML_INDEX,
 * INTERSCRIPT_ML_CACHE.
 */
export declare const DEFAULT_INDEX_URL = "https://raw.githubusercontent.com/interscript/ml-models/main/models.yaml";
export interface IndexEntry {
    filename: string;
    url: string;
    sha256: string;
}
export declare class RegistryError extends Error {
}
export interface ResolvedZip {
    bytes: Uint8Array;
    path?: string;
}
export declare function resolve(modelId: string, indexUrl?: string): Promise<ResolvedZip>;
//# sourceMappingURL=registry.d.ts.map