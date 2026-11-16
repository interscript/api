/**
 * WO15: the neural edge surface — kind-aware execution on the worker.
 *
 * Plane artifacts small enough for worker memory (budget below) run
 * IN-WORKER: zip fetched from the Releases data channel (Cache API
 * between calls), sha-verified, decoded by the interscript-ts plane
 * runtime. Larger models answer 503 with a pointer to the
 * client/runtime path — workerd caps isolate memory at 128 MB, and we
 * say so rather than OOM.
 */
/** In-worker execution budget (bytes). 100 MB leaves headroom inside
 * the 128 MB workerd isolate limit for the session + decode. */
export declare const WORKER_MODEL_MAX_BYTES: number;
export declare class MlError extends Error {
    readonly status: number;
    readonly code: string;
    constructor(status: number, code: string, message: string);
}
export interface MlRequest {
    readonly id: string;
    readonly text: string;
    readonly preserveDiacritics?: boolean;
}
/** A resolved artifact: from the index, or supplied directly (tests,
 * self-hosters with mirrors). */
export interface PlaneArtifact {
    readonly url: string;
    readonly sha256: string;
    readonly size?: number | undefined;
}
/** Errors that mean "not executable here, try the fallback path". */
export declare function isEdgeIneligible(err: unknown): boolean;
export declare function runModel(req: MlRequest): Promise<string>;
export interface ExecutePlaneArgs {
    readonly artifact: PlaneArtifact;
    readonly text: string;
    preserveDiacritics?: boolean;
}
export declare function executePlane(args: ExecutePlaneArgs): Promise<string>;
