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
const DEFAULT_WASM_PATH = "https://cdn.jsdelivr.net/npm/@litertjs/core@2.5.2/wasm/";
let cached;
async function loadLitertCore() {
    if (!cached) {
        cached = (async () => {
            try {
                return (await import("@litertjs/core"));
            }
            catch (e) {
                cached = undefined;
                throw new Error("@litertjs/core is required for LiteRT inference. Install with: npm install @litertjs/core", { cause: e });
            }
        })();
    }
    return cached;
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
export async function createLitertSession(modelData, opts = {}) {
    const accelerator = opts.accelerator ?? "webgpu";
    const wasmPath = opts.wasmPath ?? DEFAULT_WASM_PATH;
    const inputNames = opts.inputNames ?? ["src", "lengths"];
    const outputNames = opts.outputNames ?? ["output"];
    const core = await loadLitertCore();
    await core.loadLiteRt(wasmPath, { jspi: accelerator === "webnn" });
    // LiteRT.js takes a URL; create a blob URL from the bytes.
    // (In Node 18+, Blob + URL.createObjectURL are available globally.)
    const blob = new Blob([new Uint8Array(modelData)], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    let model;
    try {
        model = await core.loadAndCompile(url, { accelerator });
    }
    finally {
        // Model is compiled; the URL can be revoked. If LiteRT keeps lazy
        // references to the URL, we'd need to defer this to dispose(). Be
        // conservative and revoke on dispose instead.
    }
    return new LitertInferenceSession(model, core, inputNames, outputNames, url);
}
class LitertInferenceSession {
    inputNames;
    outputNames;
    model;
    core;
    blobUrl;
    disposed = false;
    constructor(model, core, inputNames, outputNames, blobUrl) {
        this.model = model;
        this.core = core;
        this.inputNames = inputNames;
        this.outputNames = outputNames;
        this.blobUrl = blobUrl;
    }
    async run(inputs) {
        if (this.disposed)
            throw new Error("Session disposed");
        // Convert named inputs to LiteRT Tensors, in inputNames order.
        const tensors = [];
        for (const name of this.inputNames) {
            const t = inputs[name];
            if (!t)
                throw new Error(`Missing LiteRT input: ${name}`);
            tensors.push(new this.core.Tensor(t.data, t.dims));
        }
        // Pass single tensor directly; pass array for multi-input. The
        // LiteRT.js v2.5.2 example shows single-tensor `run()`, but the
        // underlying signature accepts either form. Empirical verification
        // pending a real multi-input model.
        const results = await this.model.run(tensors.length === 1 ? tensors[0] : tensors);
        const out = {};
        try {
            for (let i = 0; i < this.outputNames.length; i++) {
                const name = this.outputNames[i];
                const resultTensor = results[i];
                if (!resultTensor) {
                    throw new Error(`LiteRT produced no output at index ${i} (expected ${name})`);
                }
                // Move to wasm-backed readable buffer; safe regardless of where
                // the tensor currently lives (webgpu or wasm).
                const moved = await resultTensor.moveTo("wasm");
                const data = await moved.toTypedArray();
                out[name] = {
                    name,
                    type: dtypeFromTypedArray(data),
                    data,
                    dims: [...resultTensor.dims],
                };
                await moved.delete();
            }
        }
        finally {
            await results.delete();
        }
        return out;
    }
    async dispose() {
        if (this.disposed)
            return;
        this.disposed = true;
        await this.model.delete();
        URL.revokeObjectURL(this.blobUrl);
    }
}
function dtypeFromTypedArray(arr) {
    if (arr instanceof Float32Array)
        return "float32";
    if (arr instanceof Int32Array)
        return "int32";
    if (arr instanceof BigInt64Array)
        return "int64";
    if (arr instanceof Uint8Array)
        return "uint8";
    return "float32";
}
//# sourceMappingURL=litert-web.js.map