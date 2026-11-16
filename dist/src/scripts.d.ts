/**
 * Input-script detection for detect(): the walk only transliterates
 * systems whose source script matches the input — loading all 288 maps
 * per request exceeds the Workers CPU budget (1102s in production).
 * Ranges cover exactly the source scripts present in the corpus.
 */
type ScriptName = string;
export declare function detectInputScript(input: string): ScriptName | null;
export declare function sourceMatchesScript(sourceScript: string | undefined, detected: string): boolean;
export {};
