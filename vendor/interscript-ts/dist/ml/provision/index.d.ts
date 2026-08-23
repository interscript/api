/**
 * Model provisioner — fetch + cache model files.
 *
 * Used by the registry to materialize a ModelRef into a session +
 * auxiliary artifacts. Reuses fetch (works in Node 18+ and modern
 * browsers); falls back to filesystem reads in Node when given a
 * `file:` or relative URL.
 *
 * The manifest (version → URL mapping) lives in `./manifest.ts`.
 * The base URL (CDN mirror override) lives in `./base.ts`.
 *
 * Adding a new provision source (e.g. IPFS, BitTorrent) = adding a
 * new provisioner file. Existing code never changes (OCP).
 */
import type { ModelArtifacts, ModelRef } from "../types.js";
import type { InferenceSession } from "../session/index.js";
import { type AssetFormat, type AssetVariant } from "./manifest.js";
export interface ProvisionedModel {
    readonly session: InferenceSession;
    readonly artifacts: ModelArtifacts;
}
/**
 * Which ONNX variant to download. `q8` is the browser default —
 * 8-bit quantized, ~25% the size of fp32 with negligible accuracy
 * loss for character-level transformers. Override per-call via
 * `provisionModel(ref, { variant: "fp32" })`.
 */
export interface ProvisionOptions {
    readonly variant?: AssetVariant;
    /**
     * Model serialization format. `onnx` (default) selects the
     * Microsoft runtime path; `tflite` selects Google's LiteRT.js.
     * Both formats can be shipped for the same model — provisioner
     * picks based on this option.
     */
    readonly format?: AssetFormat;
    /** Browser only: enable WebGPU with WASM fallback. Default: true. */
    readonly webgpu?: boolean;
    /**
     * LiteRT only: accelerator preference. Default: "webgpu".
     * No-op for ONNX runtime.
     */
    readonly litertAccelerator?: "webgpu" | "webnn" | "wasm";
    /**
     * LiteRT only: input/output tensor names. ONNX reads these from
     * the model graph; LiteRT needs them supplied by the caller.
     * Defaults are correct for rababa models.
     */
    readonly inputNames?: readonly string[];
    readonly outputNames?: readonly string[];
}
/**
 * Provision a model from the manifest. Resolves the task version,
 * downloads the model file from the CDN (falls back to GitHub
 * Releases), opens an inference session, and fetches sidecar
 * artifacts (vocab, config, checksum) in parallel.
 *
 * In Node, can read from the filesystem if `url` starts with `file:`
 * or is a relative path.
 */
export declare function provisionModel(ref: ModelRef, opts?: ProvisionOptions): Promise<ProvisionedModel>;
//# sourceMappingURL=index.d.ts.map