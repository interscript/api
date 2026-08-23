/**
 * Rababa function — wired into the stdlib function registry.
 *
 * Called from rule executors when a map invokes `rababa config: "200"`.
 * Loads the model on first use via the ML registry.
 *
 * Config keys (e.g. "200") map to a (model URL, rababa-specific config)
 * pair via a registry. The registry is populated from
 * `interscript-maps.yaml`'s `rababa-configs` section, the same source
 * the Ruby runtime uses. Callers can override at runtime via
 * `setRababaConfig(key, ...)`.
 */
import { createSession } from "../ml/session/index.js";
import { createRababaModel } from "../ml/models/rababa/diacritizer.js";
const DEFAULT_RABABA_CONFIGS = Object.freeze({
    "200": Object.freeze({
        model: "https://github.com/secryst/rababa-models/releases/download/0.1/diacritization_model_arabic.onnx",
        config: Object.freeze({
            session_name: "base",
            text_encoder: "ArabicEncoderWithStartSymbol",
            text_cleaner: "valid_arabic_cleaners",
            max_len: 200,
            batch_size: 32,
        }),
    }),
});
let rababaConfigs = new Map(Object.entries(DEFAULT_RABABA_CONFIGS));
/**
 * Register or replace a rababa config entry. Useful for tests and for
 * air-gapped environments that need to point at a local model file.
 *
 *   setRababaConfig("200", {
 *     model: "file:///path/to/model.onnx",
 *     config: { max_len: 200, batch_size: 32, ... },
 *   })
 */
export function setRababaConfig(key, entry) {
    rababaConfigs.set(key, entry);
}
/**
 * Reset the rababa config registry to the defaults shipped with the
 * library. Tests use this to undo `setRababaConfig` between cases.
 */
export function resetRababaConfigs() {
    rababaConfigs = new Map(Object.entries(DEFAULT_RABABA_CONFIGS));
}
function resolveConfig(key) {
    const entry = rababaConfigs.get(key);
    if (!entry) {
        throw new Error(`No rababa config registered under '${key}'. ` +
            `Register one via setRababaConfig() before invoking rababa.`);
    }
    return entry;
}
function buildRababaConfig(raw) {
    return {
        maxLen: Number(raw.max_len ?? raw.maxLen ?? 200),
        batchSize: Number(raw.batch_size ?? raw.batchSize ?? 32),
        textEncoder: (raw.text_encoder ?? "ArabicEncoderWithStartSymbol"),
        textCleaner: (raw.text_cleaner ?? "valid_arabic_cleaners"),
    };
}
const rababaCache = new Map();
async function getRababa(configKey) {
    let cached = rababaCache.get(configKey);
    if (!cached) {
        const entry = resolveConfig(configKey);
        cached = (async () => {
            const bytes = await fetchBytesLocal(entry.model);
            const session = await createSession(bytes);
            const config = buildRababaConfig(entry.config);
            return createRababaModel({ session, artifacts: {}, config });
        })();
        rababaCache.set(configKey, cached);
        cached.catch(() => rababaCache.delete(configKey));
    }
    return cached;
}
// Local fetch helper that handles file:// and https:// URLs.
async function fetchBytesLocal(url) {
    if (url.startsWith("file:") || url.startsWith(".")) {
        const { readFile } = await import("node:fs/promises");
        const path = url.startsWith("file:") ? url.slice(5) : url;
        return new Uint8Array(await readFile(path));
    }
    const res = await fetch(url);
    if (!res.ok)
        throw new Error(`Failed to fetch ${url}: ${res.status}`);
    return new Uint8Array(await res.arrayBuffer());
}
/**
 * Run rababa diacritization on the input.
 *
 * Maps call this as `rababa config: "200"` (the Interscript DSL).
 * The function registry in `executor.ts` dispatches funcalls with
 * `name: "rababa"` to this function.
 *
 * Async — the function executor must use `transliterateAsync` when
 * a map's stage contains a rababa call (see #67).
 */
export async function rababa(input, opts = {}) {
    const configKey = opts.config ?? "200";
    const model = await getRababa(configKey);
    return model.diacritize(input);
}
/**
 * Strip haraqat from text. Pure — no model required.
 * Used by `rababa_reverse` in maps.
 */
export function rababaReverse(input) {
    return input.replace(/[ًٌٍَُِّْ]/g, "");
}
//# sourceMappingURL=ml.js.map