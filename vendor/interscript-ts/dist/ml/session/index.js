/**
 * InferenceSession — abstract interface for running ML models.
 *
 * Three backends implement this:
 *   - onnx-node: native ONNX Runtime via onnxruntime-node (Node.js only)
 *   - onnx-web: WASM/WebGPU ONNX Runtime via onnxruntime-web (browser)
 *   - litert-web: LiteRT.js for .tflite models (browser)
 *
 * Adding a new backend = adding a new file here + exporting a factory.
 * Existing code never changes (OCP).
 *
 * Backends are loaded lazily — only the one needed is imported, keeping
 * the bundle size minimal.
 */
/**
 * Detect environment. Browser backends work in `window`, Node backends
 * work in `process.versions.node`. Some environments (Cloudflare
 * Workers, Deno) might prefer Web.
 */
export function detectBackend() {
    const g = globalThis;
    if (g.process?.versions?.node) {
        return "node";
    }
    if (g.self !== undefined) {
        return "web";
    }
    return "unknown";
}
/**
 * Create an InferenceSession from a model file. Auto-picks the backend.
 * Backend choice can be overridden via opts.backend; runtime choice
 * via opts.runtime.
 */
export async function createSession(modelData, opts = {}) {
    const runtime = opts.runtime ?? "onnx";
    // LiteRT runs in the browser only (for now — no Node.js build).
    if (runtime === "litert") {
        const litertOpts = {};
        if (opts.litertAccelerator !== undefined)
            litertOpts.accelerator = opts.litertAccelerator;
        if (opts.inputNames !== undefined)
            litertOpts.inputNames = opts.inputNames;
        if (opts.outputNames !== undefined)
            litertOpts.outputNames = opts.outputNames;
        return (await import("./litert-web.js")).createLitertSession(modelData, litertOpts);
    }
    const backend = opts.backend ?? detectBackend() === "node" ? "node" : "web";
    if (backend === "node") {
        return (await import("./onnx-node.js")).createNodeSession(modelData);
    }
    // Pass through webgpu only when explicitly set — exactOptionalPropertyTypes
    // distinguishes missing vs undefined, and we want missing = use default.
    const webOpts = opts.webgpu === undefined ? {} : { webgpu: opts.webgpu };
    return (await import("./onnx-web.js")).createWebSession(modelData, webOpts);
}
//# sourceMappingURL=index.js.map