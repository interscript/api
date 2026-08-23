/**
 * Secryst model registration — side-effect import.
 *
 * Importing this module registers the "secryst" factory with the ML
 * registry. Done in `src/ml/index.ts` so end users don't need to.
 */
export type { SecrystModel } from "./translator.js";
export { Vocab, parseVocabYaml, buildVocabs } from "./vocab.js";
export { causalMask, paddingMask, buildMasks } from "./masks.js";
//# sourceMappingURL=index.d.ts.map