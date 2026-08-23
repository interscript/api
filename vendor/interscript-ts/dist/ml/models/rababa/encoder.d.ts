/**
 * Text encoder — port of `rababa/lib/rababa/arabic/encoders.rb`.
 *
 * Converts input text into integer sequences the model can consume.
 * Two methods:
 *   - inputToSequence(text): string → number[] (token IDs)
 *   - reverse: optional, defaults to false (matches Ruby default)
 *
 * The Ruby BasicArabicEncoder + ArabicEncoderWithStartSymbol collapse
 * to a single class with options — they share the same vocab.
 */
export interface ArabicEncoderOptions {
    readonly cleaner?: "basic" | "arabic";
    readonly reverseInput?: boolean;
    readonly startSymbol?: boolean;
}
export declare class ArabicEncoder {
    readonly inputSymbolToId: Readonly<Record<string, number>>;
    readonly inputIdToSymbol: readonly string[];
    readonly inputPadId: number;
    readonly startSymbolId: number | null;
    private readonly cleanerType;
    private readonly reverse;
    constructor(opts?: ArabicEncoderOptions);
    clean(text: string): string;
    /**
     * Strip existing haraqat from `text`. Used before encoding so the
     * model doesn't see its own output as input.
     */
    removeDiacritics(text: string): string;
    /**
     * Convert a cleaned, diacritics-stripped string into a sequence
     * of token IDs.
     *
     * Skips characters not in the vocab (the Ruby version's
     * `.map.reject { |i| i.nil? }`).
     */
    inputToSequence(text: string): number[];
}
//# sourceMappingURL=encoder.d.ts.map