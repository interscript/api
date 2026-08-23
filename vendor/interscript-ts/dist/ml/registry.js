/**
 * Model registry — adding a new ML model kind is purely additive.
 *
 * Adding ByT5 / Mamba / etc. later = new file in `src/ml/models/<name>/`
 * that calls `registerModel`. Existing code never changes.
 *
 * MECE: every model kind lives in exactly one factory function.
 * OCP: registry is open for extension, closed for modification.
 * DRY: shared infrastructure (session creation, provisioning) is
 *   reused by every model.
 */
import { provisionModel } from "./provision/index.js";
const factories = new Map();
/**
 * Register a factory for a model kind. Call once per kind at module
 * load time.
 */
export function registerModel(kind, factory) {
    if (factories.has(kind)) {
        throw new Error(`Model kind "${kind}" is already registered`);
    }
    factories.set(kind, factory);
}
const cache = new Map();
function cacheKey(ref) {
    return `${ref.kind}/${ref.id}/${ref.url ?? "_default"}`;
}
/**
 * Load (or return cached) model for a given ref. The factory is
 * dispatched by `kind`; the session and artifacts are provisioned
 * by the provisioner.
 *
 * Lazy: models load only when first requested. Subsequent calls
 * return the cached instance.
 */
export async function loadModel(ref) {
    const key = cacheKey(ref);
    const cached = cache.get(key);
    if (cached)
        return cached;
    const factory = factories.get(ref.kind);
    if (!factory) {
        throw new Error(`Unknown model kind: "${ref.kind}". Register a factory via registerModel("${ref.kind}", factory).`);
    }
    const promise = (async () => {
        const { session, artifacts } = await provisionModel(ref);
        return factory({ session, artifacts });
    })();
    cache.set(key, promise);
    // On failure, drop the cached rejection so callers can retry.
    promise.catch(() => cache.delete(key));
    return promise;
}
/**
 * List registered model kinds (useful for diagnostics).
 */
export function registeredKinds() {
    return [...factories.keys()];
}
/**
 * Free all cached models. Used in tests.
 */
export async function resetModels() {
    const pending = [...cache.values()];
    cache.clear();
    await Promise.allSettled(pending.map(async (p) => {
        try {
            const m = await p;
            await m.dispose();
        }
        catch {
            // already rejected; ignore
        }
    }));
}
//# sourceMappingURL=registry.js.map