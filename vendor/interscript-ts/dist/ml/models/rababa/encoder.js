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
import { INPUT_ID_TO_SYMBOL, INPUT_SYMBOL_TO_ID, PAD_SYMBOL, } from "./haraqat.js";
import { cleanArabic, cleanBasic } from "./cleaner.js";
export class ArabicEncoder {
    inputSymbolToId = INPUT_SYMBOL_TO_ID;
    inputIdToSymbol = INPUT_ID_TO_SYMBOL;
    inputPadId;
    startSymbolId;
    cleanerType;
    reverse;
    constructor(opts = {}) {
        this.cleanerType = opts.cleaner ?? "arabic";
        this.reverse = opts.reverseInput ?? false;
        this.inputPadId = INPUT_SYMBOL_TO_ID[PAD_SYMBOL];
        this.startSymbolId = opts.startSymbol ? 0 : null;
    }
    clean(text) {
        return this.cleanerType === "arabic" ? cleanArabic(text) : cleanBasic(text);
    }
    /**
     * Strip existing haraqat from `text`. Used before encoding so the
     * model doesn't see its own output as input.
     */
    removeDiacritics(text) {
        return Array.from(text)
            .filter((c) => !(c in this.inputSymbolToId === false && /[ً-ْ]/.test(c)))
            .join("");
    }
    /**
     * Convert a cleaned, diacritics-stripped string into a sequence
     * of token IDs.
     *
     * Skips characters not in the vocab (the Ruby version's
     * `.map.reject { |i| i.nil? }`).
     */
    inputToSequence(text) {
        const chars = this.reverse ? Array.from(text).reverse() : Array.from(text);
        const out = [];
        for (const c of chars) {
            const id = this.inputSymbolToId[c];
            if (id !== undefined)
                out.push(id);
        }
        return out;
    }
}
//# sourceMappingURL=encoder.js.map