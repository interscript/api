/**
 * Browser backend — wraps onnxruntime-web with WebGPU + WASM fallback.
 *
 * Imported lazily by the session factory. Bundlers will only include
 * this in browser builds.
 *
 * onnxruntime-web is a peer dep; users install it if they need ML.
 * Without it, calling rababa() from the browser throws a clear error.
 */
import type { InferenceSession } from "../types.js";
export interface WebSessionOptions {
    /**
     * Try WebGPU first, fall back to WASM if WebGPU is unavailable or
     * fails to initialize. Default: `true` — most browsers shipped WebGPU
     * by default as of Nov 2025 (Chrome 113+, Safari 17+, Firefox 141+).
     *
     * Set to `false` to force WASM only — useful for debugging WebGPU
     * quirks or in environments where the GPU driver is known to be bad.
     */
    webgpu?: boolean;
}
export declare function createWebSession(modelData: ArrayBuffer | Uint8Array, opts?: WebSessionOptions): Promise<InferenceSession>;
//# sourceMappingURL=onnx-web.d.ts.map