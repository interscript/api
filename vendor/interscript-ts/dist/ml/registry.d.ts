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
import type { MLModel, ModelFactory, ModelKind, ModelRef } from "./types.js";
/**
 * Register a factory for a model kind. Call once per kind at module
 * load time.
 */
export declare function registerModel(kind: ModelKind, factory: ModelFactory): void;
/**
 * Load (or return cached) model for a given ref. The factory is
 * dispatched by `kind`; the session and artifacts are provisioned
 * by the provisioner.
 *
 * Lazy: models load only when first requested. Subsequent calls
 * return the cached instance.
 */
export declare function loadModel(ref: ModelRef): Promise<MLModel>;
/**
 * List registered model kinds (useful for diagnostics).
 */
export declare function registeredKinds(): readonly ModelKind[];
/**
 * Free all cached models. Used in tests.
 */
export declare function resetModels(): Promise<void>;
//# sourceMappingURL=registry.d.ts.map