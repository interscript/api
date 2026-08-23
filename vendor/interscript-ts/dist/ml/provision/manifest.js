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
import { getModelBase } from "./base.js";
const VARIANT_SUFFIX = {
    fp32: "",
    q8: "-q8",
    q4: "-q4",
    fp16: "-fp16",
};
const FORMAT_EXTENSION = {
    onnx: ".onnx",
    tflite: ".tflite",
};
let cachedManifest = null;
let inlineManifest = null;
let manifestUrlOverride = null;
export function setInlineManifest(m) {
    inlineManifest = m;
    cachedManifest = null;
}
export function setManifestUrl(url) {
    manifestUrlOverride = url;
    cachedManifest = null;
}
/**
 * Default manifest URL — sits next to release assets on the CDN.
 * Points at the jsDelivr mirror of the ml-models repo so it works
 * with zero npm install.
 */
function defaultManifestUrl() {
    return `${getModelBase()}/npm/models/manifest.json`;
}
/**
 * Load the manifest. Cached after first call; bust the cache with
 * `setInlineManifest()` or `setManifestUrl()`.
 */
export async function loadManifest() {
    if (cachedManifest)
        return cachedManifest;
    if (inlineManifest) {
        cachedManifest = inlineManifest;
        return cachedManifest;
    }
    const url = manifestUrlOverride ?? defaultManifestUrl();
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Failed to load model manifest from ${url}: ${res.status} ${res.statusText}`);
    }
    const json = (await res.json());
    cachedManifest = json;
    return json;
}
/**
 * Resolve a `(kind, id)` ref to a manifest entry. The `id` field on
 * a ModelRef carries the task name (e.g. "rababa_arabic"); the kind
 * is redundant but kept for backwards compatibility.
 *
 * Returns `null` if the task isn't in the manifest. Callers decide
 * whether that's an error or a "use bundled fallback" signal.
 */
export async function resolveManifestEntry(kind, id) {
    const manifest = await loadManifest();
    const taskKey = id.startsWith(`${kind}_`) ? id : `${kind}_${id}`;
    return manifest.models[taskKey] ?? manifest.models[id] ?? null;
}
/**
 * Build concrete artifact URLs for a model. Prefers the CDN base;
 * GitHub Releases base is the fallback (slower, but no CDN cache).
 *
 * Both URLs use the same asset naming convention so a downloader
 * can verify checksums identically against either source.
 */
export function artifactUrls(entry, variant = "q8", format = "onnx") {
    const assetName = assetNameFor(entry, variant, format);
    const versionedCdn = entry.cdn_base.replace("{version}", entry.version);
    const versionedGithub = entry.github_base.replace("{version}", entry.version);
    return {
        primary: `${versionedCdn}${assetName}`,
        fallback: `${versionedGithub}${assetName}`,
        assetName,
    };
}
/**
 * Sidecar artifacts that ship with every release. These names match
 * the release pipeline in `ml-models/.github/workflows/release.yml`.
 */
export function sidecarFilenames(entry, variant = "q8", format = "onnx") {
    const asset = assetNameFor(entry, variant, format);
    return [
        `${asset}.sha256`,
        "vocab.json",
        "config.json",
    ];
}
function assetNameFor(entry, variant, format = "onnx") {
    const task = taskNameFromBases(entry);
    return `${task}${VARIANT_SUFFIX[variant]}${FORMAT_EXTENSION[format]}`;
}
/**
 * Best-effort task name extraction from `cdn_base`/`github_base`.
 * Both bases end with `<task>-v{version}/`, so we slice off the
 * trailing version segment.
 */
function taskNameFromBases(entry) {
    const match = entry.github_base.match(/([^/]+)-v\{version\}\/$/);
    const task = match?.[1];
    if (task)
        return task;
    throw new Error(`Cannot extract task name from manifest entry. github_base=${entry.github_base}`);
}
//# sourceMappingURL=manifest.js.map