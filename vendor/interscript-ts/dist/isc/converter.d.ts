/**
 * Converts an IscDocument (parsed from .isc source) to a CompiledMapJson
 * (the runtime representation consumed by the existing TS runtime).
 *
 * This bridges the ISC parser output to the existing runtime without
 * modifying any runtime code (OCP).
 */
import type { IscDocument } from "./types.js";
import type { CompiledMapJson } from "../types.js";
export declare function iscToCompiledMap(doc: IscDocument): CompiledMapJson;
//# sourceMappingURL=converter.d.ts.map