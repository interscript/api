/**
 * Node.js backend — wraps onnxruntime-node.
 *
 * Server-only: requires Node native modules. Imported lazily by the
 * session factory only when the runtime detects a Node environment.
 * Don't import this from browser bundles.
 */
async function loadOrt() {
    try {
        return (await import("onnxruntime-node"));
    }
    catch (e) {
        throw new Error("onnxruntime-node is required for ML inference in Node. Install with: npm install onnxruntime-node", { cause: e });
    }
}
class NodeInferenceSession {
    session;
    ort;
    inputNames;
    outputNames;
    inputMetadata;
    constructor(session, ort) {
        this.session = session;
        this.ort = ort;
        this.inputNames = session.inputNames;
        this.outputNames = session.outputNames;
        const raw = session.inputMetadata;
        if (Array.isArray(raw)) {
            this.inputMetadata = raw;
        }
    }
    static async create(modelData) {
        const ort = await loadOrt();
        const session = await ort.InferenceSession.create(modelData);
        return new NodeInferenceSession(session, ort);
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
export async function createNodeSession(modelData) {
    return NodeInferenceSession.create(modelData);
}
//# sourceMappingURL=onnx-node.js.map