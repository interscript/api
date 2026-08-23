/**
 * Standard library helpers — direct port of
 * `interscript-ruby/lib/interscript/stdlib.rb`.
 *
 * Pure functions: no global state, no side effects. Easy to test in
 * isolation. Each function has exactly one responsibility (MECE).
 */
/**
 * Apply parallel string replacements in a single pass.
 *
 * Replaces all (from, to) pairs simultaneously, longest-from-first to
 * avoid ambiguity. Tree-based for O(n log n) on input length.
 *
 * Port of `Interscript::Stdlib.parallel_replace`.
 */
export declare function parallelReplace(input: string, pairs: readonly (readonly [string, string])[]): string;
/**
 * Trie node for parallel replacement. Maps char code → child node.
 * `match` holds the replacement string when this node is the end of a
 * complete "from" pattern.
 *
 * Port of Ruby's nested-hash tree with `nil` sentinel for matches.
 */
export interface ParallelTrieNode {
    readonly children: Map<number, ParallelTrieNode>;
    match: string | null;
}
export declare function emptyTrieNode(): ParallelTrieNode;
/**
 * Build a trie from (from, to) pairs. Each "from" string becomes a path
 * from root through character codes; the final node holds `match = to`.
 *
 * Multiple "from"s can share prefixes naturally. Longest match wins at
 * runtime (handled by `parallelReplaceTree`).
 *
 * Port of `Interscript::Stdlib.parallel_replace_compile_tree`.
 */
export declare function compileParallelTree(pairs: readonly (readonly [string, string])[]): ParallelTrieNode;
/**
 * Walk `input` against the trie, emitting the longest match at each
 * position. Falls back to passing through the character unchanged.
 *
 * Port of `Interscript::Stdlib.parallel_replace_tree`.
 */
export declare function parallelReplaceTree(input: string, tree: ParallelTrieNode): string;
/**
 * Escape a string so it matches literally inside a RegExp.
 * Port of Ruby's `Regexp.escape`.
 */
export declare function regexpEscape(input: string): string;
/**
 * Lowercase a string. Maps to `Interscript.functions.downcase`.
 */
export declare function downcase(input: string): string;
/**
 * Uppercase a string. Maps to `Interscript.functions.upcase`.
 */
export declare function upcase(input: string): string;
/**
 * Capitalise each word; honours custom word separator.
 * Maps to `Interscript.functions.title_case`.
 */
export declare function titleCase(input: string, opts?: {
    wordSeparator?: string;
}): string;
/**
 * Insert a separator between every character.
 * Maps to `Interscript.functions.separate`.
 */
export declare function separate(input: string, opts?: {
    separator?: string;
}): string;
/**
 * Unicode NFC normalisation via String.prototype.normalize.
 */
export declare function compose(input: string): string;
export declare function decompose(input: string): string;
/**
 * Megaregexp parallel replace — Ruby's fallback for parallel blocks
 * where any rule has `before`/`after`/`not_before`/`not_after` constraints.
 *
 * Mirrors `Interscript::Stdlib.parallel_regexp_compile` + `parallel_regexp_gsub`:
 * all rules join into one alternation `(?<g0>p0)|(?<g1>p1)|...` and a single
 * gsub decides which alternative matched via the named group. Rule order is
 * pre-sorted by the caller (longest `max_length` first, declaration order
 * as tiebreaker — matching Ruby's `deterministic_sort_by_max_length`).
 *
 * Onigmo and V8 share alternation semantics: at each scan position,
 * alternatives are tried in declaration order and the first match wins.
 */
export interface MegaregexpRule {
    readonly pattern: string;
    readonly replace: (match: string, groups: (string | undefined)[]) => string;
}
export declare function parallelMegaregexp(input: string, rules: readonly MegaregexpRule[]): string;
//# sourceMappingURL=stdlib.d.ts.map