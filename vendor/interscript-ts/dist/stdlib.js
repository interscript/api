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
export function parallelReplace(input, pairs) {
    if (pairs.length === 0)
        return input;
    return parallelReplaceTree(input, compileParallelTree(pairs));
}
export function emptyTrieNode() {
    return { children: new Map(), match: null };
}
/**
 * Build a trie from (from, to) pairs. Each "from" string becomes a path
 * from root through character codes; the final node holds `match = to`.
 *
 * Multiple "from"s can share prefixes naturally. Longest match wins at
 * runtime (handled by `parallelReplaceTree`).
 *
 * Port of `Interscript::Stdlib.parallel_replace_compile_tree`.
 */
export function compileParallelTree(pairs) {
    const root = emptyTrieNode();
    for (const [from, to] of pairs) {
        if (from.length === 0)
            continue;
        let branch = root;
        for (let i = 0; i < from.length - 1; i++) {
            const code = from.charCodeAt(i);
            let next = branch.children.get(code);
            if (!next) {
                next = emptyTrieNode();
                branch.children.set(code, next);
            }
            branch = next;
        }
        const last = from.charCodeAt(from.length - 1);
        let leaf = branch.children.get(last);
        if (!leaf) {
            leaf = emptyTrieNode();
            branch.children.set(last, leaf);
        }
        leaf.match = to;
    }
    return root;
}
/**
 * Walk `input` against the trie, emitting the longest match at each
 * position. Falls back to passing through the character unchanged.
 *
 * Port of `Interscript::Stdlib.parallel_replace_tree`.
 */
export function parallelReplaceTree(input, tree) {
    let out = "";
    const len = input.length;
    let i = 0;
    while (i < len) {
        let branch = tree;
        let matchEnd = 0;
        let matchReplacement = null;
        for (let j = 0; i + j < len; j++) {
            const code = input.charCodeAt(i + j);
            const next = branch.children.get(code);
            if (!next)
                break;
            branch = next;
            if (branch.match !== null) {
                matchEnd = j + 1;
                matchReplacement = branch.match;
            }
        }
        if (matchReplacement !== null && matchEnd > 0) {
            out += matchReplacement;
            i += matchEnd;
        }
        else {
            out += input[i];
            i += 1;
        }
    }
    return out;
}
/**
 * Escape a string so it matches literally inside a RegExp.
 * Port of Ruby's `Regexp.escape`.
 */
export function regexpEscape(input) {
    return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
/**
 * Lowercase a string. Maps to `Interscript.functions.downcase`.
 */
export function downcase(input) {
    return input.toLowerCase();
}
/**
 * Uppercase a string. Maps to `Interscript.functions.upcase`.
 */
export function upcase(input) {
    return input.toUpperCase();
}
/**
 * Capitalise each word; honours custom word separator.
 * Maps to `Interscript.functions.title_case`.
 */
export function titleCase(input, opts = {}) {
    const sep = opts.wordSeparator ?? " ";
    if (sep === "")
        return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
    return input
        .split(sep)
        .map((w) => (w.length === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
        .join(sep);
}
/**
 * Insert a separator between every character.
 * Maps to `Interscript.functions.separate`.
 */
export function separate(input, opts = {}) {
    const sep = opts.separator ?? " ";
    return input.split("").join(sep);
}
/**
 * Unicode NFC normalisation via String.prototype.normalize.
 */
export function compose(input) {
    return input.normalize("NFC");
}
export function decompose(input) {
    return input.normalize("NFD");
}
export function parallelMegaregexp(input, rules) {
    if (rules.length === 0)
        return input;
    const parts = rules.map((r, i) => `(?<__r${i}>${r.pattern})`);
    const re = new RegExp(parts.join("|"), "gmu");
    return input.replace(re, (...args) => {
        const groups = args[args.length - 1];
        for (let i = 0; i < rules.length; i++) {
            if (groups[`__r${i}`] !== undefined) {
                const match = args[0];
                const captures = args.slice(1, -2);
                return rules[i].replace(match, captures);
            }
        }
        return args[0];
    });
}
//# sourceMappingURL=stdlib.js.map