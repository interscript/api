/**
 * Domain model for Interscript — TypeScript-native port of the Ruby AST.
 *
 * Design principles (per OCP):
 *   - AST nodes are discriminated unions, not class hierarchies. Adding a
 *     new node kind = adding a new variant + a new executor registration.
 *     Existing executors never need to change.
 *   - Each type maps to exactly one Ruby AST concept (MECE).
 *   - Public types live here so consumers can pattern-match without
 *     depending on internal file layout.
 */
export {};
//# sourceMappingURL=types.js.map