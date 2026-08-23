/**
 * Node.js backend — wraps onnxruntime-node.
 *
 * Server-only: requires Node native modules. Imported lazily by the
 * session factory only when the runtime detects a Node environment.
 * Don't import this from browser bundles.
 */
import type { InferenceSession } from "../types.js";
export declare function createNodeSession(modelData: ArrayBuffer | Uint8Array): Promise<InferenceSession>;
//# sourceMappingURL=onnx-node.d.ts.map