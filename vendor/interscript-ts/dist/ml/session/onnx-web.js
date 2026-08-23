/**
 * Browser backend — wraps onnxruntime-web with WebGPU + WASM fallback.
 *
 * Imported lazily by the session factory. Bundlers will only include
 * this in browser builds.
 *
 * onnxruntime-web is a peer dep; users install it if they need ML.
 * Without it, calling rababa() from the browser throws a clear error.
 */
let cached;
async function loadOrt() {
    if (!cached) {
        cached = (async () => {
            try {
                const mod = (await import("onnxruntime-web"));
                // Use SIMD when available (~2x faster for WASM fallback path).
                mod.env.wasm.simd = true;
                return mod;
            }
            catch (e) {
                cached = undefined;
                throw new Error("onnxruntime-web is required for ML inference in the browser. Install with: npm install onnxruntime-web", { cause: e });
            }
        })();
    }
    return cached;
}
class WebInferenceSession {
    session;
    ort;
    inputNames;
    outputNames;
    constructor(session, ort) {
        this.session = session;
        this.ort = ort;
        this.inputNames = session.inputNames;
        this.outputNames = session.outputNames;
    }
    static async create(modelData, opts = {}) {
        const ort = await loadOrt();
        // Execution provider preference — onnxruntime-web picks the first
        // available; WebGPU silently falls back to WASM when unavailable.
        const executionProviders = opts.webgpu === false ? ["wasm"] : ["webgpu", "wasm"];
        const session = await ort.InferenceSession.create(modelData, {
            executionProviders,
        });
        return new WebInferenceSession(session, ort);
    }
    async run(inputs) {
        const feeds = {};
        for (const [name, tensor] of Object.entries(inputs)) {
            feeds[name] = new this.ort.Tensor(tensor.type, tensor.data, tensor.dims);
        }
        const outputs = await this.session.run(feeds);
        const out = {};
        for (const [name, value] of Object.entries(outputs)) {
            const v = value;
            out[name] = {
                name,
                type: v.type,
                data: v.data,
                dims: v.dims,
            };
        }
        return out;
    }
    async dispose() {
        await this.session.release();
    }
}
export async function createWebSession(modelData, opts = {}) {
    return WebInferenceSession.create(modelData, opts);
}
//# sourceMappingURL=onnx-web.js.map