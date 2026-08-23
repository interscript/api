/**
 * Manifest-driven model resolution.
 *
 * The source of truth for "what model version is current" lives in
 * the `@interscript/models` npm package (a tiny JSON manifest kept
 * in lockstep with GH Releases in `interscript/ml-models`).
 *
 * Resolution order for the manifest itself:
 *   1. Programmatically injected via `setManifestUrl()` or
 *      `setInlineManifest()` (tests, air-gapped envs).
 *   2. The `@interscript/models` package, when installed.
 *   3. A remote JSON URL on the CDN (`manifest.json` next to the
 *      release assets).
 *
 * See `ml-models/TODO.distribution/04-npm-packages.md` for the
 * full MECE breakdown of who owns what.
 */
/**
 * Per-task manifest entry. Matches `npm/models/manifest.json` shape.
 */
export interface ManifestModelEntry {
    readonly status: "preview" | "stable" | "deprecated";
    readonly version: string;
    readonly note?: string;
    readonly cdn_base: string;
    readonly github_base: string;
}
export interface Manifest {
    readonly schema_version: number;
    readonly models: Readonly<Record<string, ManifestModelEntry>>;
}
/**
 * Asset variants a release may ship. `fp32` (no suffix) is the
 * default; q8 is the browser-optimized default.
 */
export type AssetVariant = "fp32" | "q8" | "q4" | "fp16";
/**
 * Serialization format. ONNX is the historical default; LiteRT (.tflite)
 * is the 2026 alternative backed by Google's LiteRT.js runtime.
 *
 * The two formats are orthogonal to `AssetVariant` — both can be
 * quantized to q8, both can be fp32. The runtime that loads the file
 * is what differs.
 */
export type AssetFormat = "onnx" | "tflite";
export declare function setInlineManifest(m: Manifest | null): void;
export declare function setManifestUrl(url: string | null): void;
/**
 * Load the manifest. Cached after first call; bust the cache with
 * `setInlineManifest()` or `setManifestUrl()`.
 */
export declare function loadManifest(): Promise<Manifest>;
/**
 * Resolve a `(kind, id)` ref to a manifest entry. The `id` field on
 * a ModelRef carries the task name (e.g. "rababa_arabic"); the kind
 * is redundant but kept for backwards compatibility.
 *
 * Returns `null` if the task isn't in the manifest. Callers decide
 * whether that's an error or a "use bundled fallback" signal.
 */
export declare function resolveManifestEntry(kind: string, id: string): Promise<ManifestModelEntry | null>;
/**
 * Build concrete artifact URLs for a model. Prefers the CDN base;
 * GitHub Releases base is the fallback (slower, but no CDN cache).
 *
 * Both URLs use the same asset naming convention so a downloader
 * can verify checksums identically against either source.
 */
export declare function artifactUrls(entry: ManifestModelEntry, variant?: AssetVariant, format?: AssetFormat): {
    primary: string;
    fallback: string;
    assetName: string;
};
/**
 * Sidecar artifacts that ship with every release. These names match
 * the release pipeline in `ml-models/.github/workflows/release.yml`.
 */
export declare function sidecarFilenames(entry: ManifestModelEntry, variant?: AssetVariant, format?: AssetFormat): readonly string[];
//# sourceMappingURL=manifest.d.ts.map