/**
 * Rababa model registration — side-effect import.
 *
 * Importing this module registers the "rababa" factory with the ML
 * registry. Done in `src/ml/index.ts` so end users don't need to.
 */
import { registerModel } from "../../registry.js";
import { createRababaModel } from "./diacritizer.js";
registerModel("rababa", async (params) => createRababaModel(params));
export { ArabicEncoder } from "./encoder.js";
export { reconcileStrings } from "./reconciler.js";
export { cleanArabic, cleanBasic, collapseWhitespace } from "./cleaner.js";
export * from "./haraqat.js";
//# sourceMappingURL=index.js.map