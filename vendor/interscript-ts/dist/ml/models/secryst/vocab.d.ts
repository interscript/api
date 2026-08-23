/**
 * Secryst vocabulary — port of `secryst/lib/secryst/vocab.rb`.
 *
 * Maps tokens to integer IDs (stoi) and back (itos). Supports
 * special tokens (<sos>, <eos>, <pad>) alongside character-level
 * vocab.
 */
export interface VocabData {
    readonly input: readonly string[];
    readonly target: readonly string[];
}
export declare class Vocab {
    readonly stoi: Readonly<Record<string, number>>;
    readonly itos: readonly string[];
    readonly length: number;
    constructor(tokens: readonly string[], specials?: readonly string[]);
    /** String to ID. Returns -1 for unknown tokens. */
    encode(token: string): number;
    /** ID to string. Returns "" for unknown IDs. */
    decode(id: number): string;
    /** Encode a string into a sequence of token IDs. */
    encodeSequence(text: string): number[];
    /** Decode a sequence of token IDs back into a string. */
    decodeSequence(ids: readonly number[]): string;
}
/**
 * Parse vocab data from YAML format (as stored in the model zip).
 * Uses js-yaml if available, otherwise a minimal YAML parser for
 * the simple list format secryst uses.
 */
export declare function parseVocabYaml(yaml: string): VocabData;
/**
 * Build Vocab instances from parsed data.
 */
export declare function buildVocabs(data: VocabData): {
    input: Vocab;
    target: Vocab;
};
//# sourceMappingURL=vocab.d.ts.map