/**
 * LiteRT.js backend — runs .tflite models via Google's runtime.
 *
 * Parallel to onnx-web.ts. Same InferenceSession interface. Lazy-loaded
 * so bundlers exclude it from builds that don't use LiteRT.
 *
 * `@litertjs/core` is a peer dep — users install it if they want the
 * LiteRT runtime. Without it, calling with `runtime: 'litert'` throws
 * a clear error.
 *
 * Note: as of v2.5.2 (released July 9, 2026), the LiteRT.js API is
 * still settling. This wrapper isolates users from API churn — when
 * Google ships breaking changes, we absorb them here.
 *
 * Known API gaps to verify with real models (deferred until v0.1.0
 * produces a real .tflite artifact):
 *   - Multi-input: example shows `model.run(singleTensor)`. We pass an
 *     array when inputNames.length > 1; will adjust if API differs.
 *   - Multi-output: result object shape unknown until we have a real
 *     multi-head .tflite.
 *   - Int64 inputs: our model has int64 src/lengths. Tensor constructor
 *     accepts TypedArray; BigInt64Array should work but untested.
 */
import type { InferenceSession } from "../types.js";
export interface LitertSessionOptions {
    /**
     * Accelerator preference. Default: 'webgpu' (falls back to 'wasm'
     * automatically inside LiteRT.js if WebGPU is unavailable).
     */
    accelerator?: "webgpu" | "webnn" | "wasm";
    /**
     * URL prefix serving the LiteRT.js WASM files. Default: jsdelivr CDN.
     * Override for self-hosted deployments or offline use.
     */
    wasmPath?: string;
}
/**
 * Create a LiteRT.js session from a .tflite model blob.
 *
 * Caller supplies input/output names because the .tflite default
 * signature names are auto-generated (e.g. "args_0"). For our rababa
 * models, use:
 *   - single-head: inputNames=["src","lengths"], outputNames=["output"]
 *   - multi-head:  inputNames=["src","lengths"], outputNames=["niqqud","dagesh","sin"]
 */
export declare function createLitertSession(modelData: ArrayBuffer | Uint8Array, opts?: LitertSessionOptions & {
    inputNames?: readonly string[];
    outputNames?: readonly string[];
}): Promise<InferenceSession>;
//# sourceMappingURL=litert-web.d.ts.map