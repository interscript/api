/**
 * Text cleaner — mirrors `rababa/lib/rababa/{cleaner,arabic/cleaner}.rb`.
 *
 * Two cleaners, both pure functions:
 *   - cleanBasic: collapse whitespace, strip
 *   - cleanArabic: keep only VALID_ARABIC chars, then cleanBasic
 */
export declare function collapseWhitespace(text: string): string;
export declare function cleanBasic(text: string): string;
export declare function cleanArabic(text: string): string;
//# sourceMappingURL=cleaner.d.ts.map