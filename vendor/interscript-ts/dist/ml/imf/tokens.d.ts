/**
 * The canonical ByT5 byte table (shared contract with the Python and
 * Ruby runtimes): byte b -> token id b+3, trailing EOS; pad=0, unk=2.
 * Token ids are NOT raw byte values — feeding TextEncoder output
 * directly as ids silently produces garbage on real checkpoints.
 */
export declare const BYTE_OFFSET = 3;
export declare const PAD_ID = 0;
export declare const EOS_ID = 1;
export declare const UNK_ID = 2;
export declare function encode(text: string): number[];
export declare function decode(tokenIds: readonly number[]): string;
//# sourceMappingURL=tokens.d.ts.map