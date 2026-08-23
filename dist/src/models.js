/**
 * The neural model index: a generated projection of interscript-ml's
 * models.yaml (the IMF v1 contract). Regenerate with
 * `npm run gen:models` from a checkout of interscript/interscript-ml.
 */
import index from "./generated/models.json";
const data = index;
export function listModels() {
    return data.models;
}
export function getModel(id) {
    return data.models.find((m) => m.id === id);
}
export const MODELS_INDEX_VERSION = data.version;
