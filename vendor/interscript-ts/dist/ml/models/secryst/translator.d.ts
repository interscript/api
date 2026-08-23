/**
 * Secryst translator — autoregressive seq2seq decode loop.
 *
 * Port of `secryst/lib/secryst/translator.rb:translate`.
 *
 * The transformer generates output one token at a time:
 *   1. Encode input: chars → vocab IDs, wrap with <sos>/<eos>
 *   2. Initialize output: [<sos>]
 *   3. Loop (max_seq_length times):
 *      a. Build masks for current src + tgt lengths
 *      b. Run ONNX inference
 *      c. Argmax → next token ID
 *      d. If <eos>: break
 *      e. Append to output
 *   4. Decode output IDs → string
 */
import type { InferenceSession, MLModel, ModelArtifacts, ModelKind } from "../../types.js";
export interface SecrystModel extends MLModel {
    readonly kind: ModelKind;
    translate(text: string, maxSeqLength?: number): Promise<string>;
    transform(input: string): Promise<string>;
    dispose(): Promise<void>;
}
/**
 * Factory: builds a SecrystModel from a session + artifacts.
 */
export declare function createSecrystModel(params: {
    readonly session: InferenceSession;
    readonly artifacts: ModelArtifacts;
}): Promise<SecrystModel>;
//# sourceMappingURL=translator.d.ts.map