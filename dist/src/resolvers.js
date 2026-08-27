/**
 * Resolvers — behavior-matched to the Ruby API. The map assets binding
 * arrives via the Yoga context (yoga.fetch(request, env, ctx)).
 */
import { MapNotFoundError as EngineMapNotFoundError } from "interscript";
import { detect, transliterate } from "./engine.js";
import { InputTooLongError, MapNotFoundError } from "./errors.js";
import { INFER_TIMEOUT_MS, LIMITS } from "./limits.js";
import { bundledSystemCodes } from "./engine.js";
export const API_VERSION = "3.0.0-cloudflare.1";
// The ASSETS binding is constant for an isolate's lifetime; the Hono
// handler sets it once from c.env (threaded correctly by Hono in both
// Workers and tests).
let assets;
export function setAssets(binding) {
    assets = binding;
}
let ml;
export function setMl(endpoint, token) {
    ml = endpoint && token ? { endpoint, token } : undefined;
}
// Legacy wire compatibility: the old Ruby API proxied rababa system
// codes to the ML service; the interscript.org demo still calls this
// through GraphQL and REST transliterate.
const RABABA_MODELS = {
    "var-ara-Arab-Arab-rababa": "ara-diac-1.0",
};
async function infer(model, input) {
    if (!ml) {
        throw new Error("ML inference unavailable — ML_ENDPOINT/ML_TOKEN not set");
    }
    const res = await fetch(`${ml.endpoint}/infer`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": ml.token },
        body: JSON.stringify({ model, input }),
        signal: AbortSignal.timeout(INFER_TIMEOUT_MS),
    }).catch(() => null);
    if (!res || !res.ok) {
        throw new Error("ML inference upstream failed");
    }
    const out = (await res.json().catch(() => null));
    if (!out || typeof out.output !== "string") {
        throw new Error("ML inference returned no output");
    }
    return out.output;
}
export function requireAssets() {
    if (!assets) {
        throw new Error("ASSETS binding missing — see README deployment notes");
    }
    return assets;
}
export async function info() {
    return JSON.stringify({
        version: API_VERSION,
        engine: "interscript-ts@native-interpreter",
    });
}
export function systemCodesResolver() {
    return [...bundledSystemCodes()];
}
export async function transliterateResolver(systemCode, input) {
    if (input.length > LIMITS.input_max_size) {
        throw new InputTooLongError(LIMITS.input_max_size);
    }
    const rababaModel = RABABA_MODELS[systemCode];
    if (rababaModel) {
        return infer(rababaModel, input);
    }
    try {
        return await transliterate(requireAssets(), systemCode, input);
    }
    catch (e) {
        // Engine convention is "Map not found: X"; the public API has
        // always said "Couldn't locate X" — keep client compatibility.
        if (e instanceof EngineMapNotFoundError) {
            throw new MapNotFoundError(systemCode);
        }
        throw e;
    }
}
export async function detectResolver(input, output) {
    return detect(requireAssets(), input, output);
}
