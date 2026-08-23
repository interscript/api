/**
 * Arabic haraqat (diacritic marks) + character classes.
 *
 * Direct port of `rababa/lib/rababa/arabic.rb` constants. These are
 * Unicode code-point references — kept exactly as the Ruby source
 * defines them so the encoder vocab matches the trained model.
 */
/** Single haraqat (basic diacritics). */
export declare const HARAQAT: readonly ["ْ", "ّ", "ٌ", "ٍ", "ِ", "ً", "َ", "ُ"];
/** Unicode escapes of HARAQAT for clarity. */
export declare const UHARAQAT: readonly ["ْ", "ّ", "ٌ", "ٍ", "ِ", "ً", "َ", "ُ"];
/** Punctuations allowed by the Arabic cleaner. */
export declare const PUNCTUATIONS: readonly [".", "،", ":", "؛", "-", "؟"];
/** Arabic characters the model accepts (including space). */
export declare const ARAB_CHARS = "\u0649\u0639\u0638\u062D\u0631\u0633\u064A\u0634\u0636\u0642 \u062B\u0644\u0635\u0637\u0643\u0622\u0645\u0627\u0625\u0647\u0632\u0621\u0623\u0641\u0624\u063A\u062C\u0626\u062F\u0629\u062E\u0648\u0628\u0630\u062A\u0646";
/** Arabic characters without the space. */
export declare const ARAB_CHARS_NO_SPACE = "\u0649\u0639\u0638\u062D\u0631\u0633\u064A\u0634\u0636\u0642\u062B\u0644\u0635\u0637\u0643\u0622\u0645\u0627\u0625\u0647\u0632\u0621\u0623\u0641\u0624\u063A\u062C\u0626\u062F\u0629\u062E\u0648\u0628\u0630\u062A\u0646";
/** Valid Arabic characters for the cleaner's whitelist. */
export declare const VALID_ARABIC: string[];
/**
 * Map of basic haraqat → display name. Used for human-readable
 * diagnostics; the model uses indices into ALL_POSSIBLE_HARAQAT.
 */
export declare const BASIC_HARAQAT: Readonly<Record<string, string>>;
/**
 * Complete output vocabulary: every haraqat combination the model
 * can predict. Index into this dict = target token ID.
 *
 * Order matters — must match the model's training-time vocab order.
 */
export declare const ALL_POSSIBLE_HARAQAT: Readonly<Record<string, string>>;
/**
 * Reverse lookup: haraqat string → index. Matches the encoder's
 * `@target_symbol_to_id`.
 */
export declare const HARAAQAT_TO_ID: Readonly<Record<string, number>>;
export declare const ID_TO_HARAAQAT: readonly string[];
/**
 * Input vocab used by BasicArabicEncoder. Index 0 = pad ("P");
 * remaining indices match the source's input_chars string.
 *
 * Direct port of `rababa/lib/rababa/arabic/encoders.rb:84`.
 */
export declare const INPUT_CHARS = "\u0628\u0636.\u063A\u0649\u0647\u0638\u062E\u0629\u061F:\u0637\u0633\u060C\u061B\u0641\u0646\u062F\u0624\u0644\u0648\u0626\u0622\u0643-\u064A\u0630\u0627\u0635\u0634\u062D\u0632\u0621\u0645\u0623\u062C\u0625 \u062A\u0631\u0642\u0639\u062B";
export declare const PAD_SYMBOL = "P";
export declare const INPUT_VOCAB: readonly string[];
export declare const INPUT_SYMBOL_TO_ID: Readonly<Record<string, number>>;
export declare const INPUT_ID_TO_SYMBOL: readonly string[];
//# sourceMappingURL=haraqat.d.ts.map