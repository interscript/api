/**
 * IMF v1 zip loading: manifest parse, per-graph sha256 verification.
 * Corrupt downloads fail loudly, before any session is created.
 */
export interface IMFManifest {
    format: string;
    id: string;
    task: string;
    decoder: string;
    precision: string;
    opset: number;
    sha256: Record<string, string>;
}
export declare class IMFError extends Error {
}
export declare function parseManifest(zipBytes: Uint8Array): IMFManifest;
/** Unzip + sha256-verify every .onnx member; returns name -> bytes. */
export declare function verifyAndRead(zipBytes: Uint8Array): Promise<Map<string, Uint8Array>>;
//# sourceMappingURL=loader.d.ts.map