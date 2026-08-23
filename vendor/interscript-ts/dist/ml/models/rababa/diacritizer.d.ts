/**
 * Rababa diacritizer — port of `rababa/lib/rababa/arabic/diacritizer.rb`.
 *
 * Pipeline:
 *   text → clean → strip diacritics → encode to IDs
 *        → ONNX inference ({src, lengths}) → logits
 *        → argmax over classes → haraqat IDs
 *        → combine: original letters + predicted haraqat
 *        → reconcile with original input (preserves non-Arabic chars)
 *
 * The model file is loaded by the provisioner; we receive an
 * InferenceSession + config artifacts.
 */
import type { InferenceSession, MLModel, ModelArtifacts, ModelKind } from "../../types.js";
export interface RababaConfig {
    readonly maxLen: number;
    readonly batchSize: number;
    readonly textEncoder: "BasicArabicEncoder" | "ArabicEncoderWithStartSymbol";
    readonly textCleaner: "basic_cleaners" | "valid_arabic_cleaners";
}
export interface RababaModel extends MLModel {
    readonly kind: ModelKind;
    diacritize(text: string): Promise<string>;
    transform(input: string): Promise<string>;
    dispose(): Promise<void>;
}
/**
 * Factory: builds a RababaModel from a session + artifacts.
 *
 * Registered as the factory for kind "rababa" in src/ml/index.ts.
 */
export declare function createRababaModel(params: {
    readonly session: InferenceSession;
    readonly artifacts: ModelArtifacts;
    readonly config?: RababaConfig;
}): Promise<RababaModel>;
//# sourceMappingURL=diacritizer.d.ts.map