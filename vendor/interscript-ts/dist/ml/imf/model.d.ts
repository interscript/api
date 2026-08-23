/**
 * IMFModel — a loaded, checksum-verified IMF v1 model. Greedy KV-cache
 * decode when the zip ships decoder-kv.onnx (default), plain
 * full-recompute fallback otherwise. The decode loop is the shared
 * cross-runtime contract; outputs are byte-identical with the Python
 * reference on the golden sets.
 */
export declare class IMFModel {
    readonly id: string;
    private readonly manifest;
    private readonly encoder;
    private readonly decoder;
    private readonly kv;
    private readonly pasts;
    private constructor();
    static fromZipBytes(zipBytes: Uint8Array): Promise<IMFModel>;
    /** Accepts a zip path (Node), raw zip bytes, or a models.yaml model id. */
    static load(source: string | Uint8Array, indexUrl?: string): Promise<IMFModel>;
    translate(text: string, maxLen?: number): Promise<string>;
    dispose(): Promise<void>;
    private runEncoder;
    private zeroPastSpecs;
    private pastTensors;
    private argmaxLastStep;
    private greedyKv;
    private greedyPlain;
}
//# sourceMappingURL=model.d.ts.map