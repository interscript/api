/**
 * Rababa function — wired into the stdlib function registry.
 *
 * Called from rule executors when a map invokes `rababa config: "200"`.
 * Loads the model on first use via the ML registry.
 *
 * Config keys (e.g. "200") map to a (model URL, rababa-specific config)
 * pair via a registry. The registry is populated from
 * `interscript-maps.yaml`'s `rababa-configs` section, the same source
 * the Ruby runtime uses. Callers can override at runtime via
 * `setRababaConfig(key, ...)`.
 */
/**
 * Rababa config — mirrors the YAML structure of `rababa-configs:` in
 * `interscript-maps.yaml`. The `model` is a URL to the ONNX file; the
 * `config` is passed to the diacritizer.
 */
export interface RababaConfigEntry {
    readonly model: string;
    readonly config: Readonly<Record<string, unknown>>;
}
/**
 * Register or replace a rababa config entry. Useful for tests and for
 * air-gapped environments that need to point at a local model file.
 *
 *   setRababaConfig("200", {
 *     model: "file:///path/to/model.onnx",
 *     config: { max_len: 200, batch_size: 32, ... },
 *   })
 */
export declare function setRababaConfig(key: string, entry: RababaConfigEntry): void;
/**
 * Reset the rababa config registry to the defaults shipped with the
 * library. Tests use this to undo `setRababaConfig` between cases.
 */
export declare function resetRababaConfigs(): void;
/**
 * Run rababa diacritization on the input.
 *
 * Maps call this as `rababa config: "200"` (the Interscript DSL).
 * The function registry in `executor.ts` dispatches funcalls with
 * `name: "rababa"` to this function.
 *
 * Async — the function executor must use `transliterateAsync` when
 * a map's stage contains a rababa call (see #67).
 */
export declare function rababa(input: string, opts?: {
    config?: string;
}): Promise<string>;
/**
 * Strip haraqat from text. Pure — no model required.
 * Used by `rababa_reverse` in maps.
 */
export declare function rababaReverse(input: string): string;
//# sourceMappingURL=ml.d.ts.map