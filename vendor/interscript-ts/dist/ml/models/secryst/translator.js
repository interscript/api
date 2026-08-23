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
import { buildVocabs, parseVocabYaml } from "./vocab.js";
import { buildMasks } from "./masks.js";
const DEFAULT_MAX_SEQ = 100;
const SOS_TOKEN = "<sos>";
const EOS_TOKEN = "<eos>";
class SecrystModelImpl {
    kind = "secryst";
    session;
    inputVocab;
    targetVocab;
    constructor(session, inputVocab, targetVocab) {
        this.session = session;
        this.inputVocab = inputVocab;
        this.targetVocab = targetVocab;
    }
    async translate(text, maxSeqLength = DEFAULT_MAX_SEQ) {
        // Encode input: <sos> + chars + <eos>
        const srcIds = [
            this.inputVocab.encode(SOS_TOKEN),
            ...this.inputVocab.encodeSequence(text),
            this.inputVocab.encode(EOS_TOKEN),
        ].filter((id) => id >= 0);
        // Initialize output with <sos>
        const tgtIds = [this.targetVocab.encode(SOS_TOKEN)];
        const eosId = this.targetVocab.encode(EOS_TOKEN);
        for (let step = 0; step < maxSeqLength; step++) {
            const masks = buildMasks(srcIds.length, tgtIds.length, srcIds, tgtIds);
            const feeds = {
                src: {
                    name: "src",
                    type: "int64",
                    data: new BigInt64Array(srcIds.map((n) => BigInt(n))),
                    dims: [1, srcIds.length],
                },
                tgt: {
                    name: "tgt",
                    type: "int64",
                    data: new BigInt64Array(tgtIds.map((n) => BigInt(n))),
                    dims: [1, tgtIds.length],
                },
                ...masks,
            };
            const outputs = await this.session.run(feeds);
            const out = outputs[this.session.outputNames[0]];
            if (!out)
                throw new Error("Secryst model produced no output");
            // Argmax over the last position's class dimension
            const dims = out.dims;
            const classCount = dims[dims.length - 1];
            const data = out.data;
            const lastPosBase = step * classCount;
            let bestId = 0;
            let bestVal = -Infinity;
            for (let c = 0; c < classCount; c++) {
                const v = typeof data[lastPosBase + c] === "bigint"
                    ? Number(data[lastPosBase + c])
                    : data[lastPosBase + c];
                if (v > bestVal) {
                    bestVal = v;
                    bestId = c;
                }
            }
            if (bestId === eosId)
                break;
            tgtIds.push(bestId);
        }
        // Drop the <sos> and return decoded text
        return this.targetVocab.decodeSequence(tgtIds.slice(1));
    }
    /** Unified MLModel interface — processes line by line (matching Ruby). */
    async transform(input) {
        const lines = input.split("\n");
        const results = [];
        for (const line of lines) {
            results.push(await this.translate(line));
        }
        return results.join("\n");
    }
    async dispose() {
        await this.session.dispose();
    }
}
/**
 * Factory: builds a SecrystModel from a session + artifacts.
 */
export async function createSecrystModel(params) {
    const vocabsRaw = params.artifacts["vocabs.yaml"];
    if (!vocabsRaw) {
        throw new Error("Secryst model missing vocabs.yaml");
    }
    const yamlStr = typeof vocabsRaw === "string"
        ? vocabsRaw
        : new TextDecoder().decode(vocabsRaw);
    const data = parseVocabYaml(yamlStr);
    const { input, target } = buildVocabs(data);
    return new SecrystModelImpl(params.session, input, target);
}
//# sourceMappingURL=translator.js.map