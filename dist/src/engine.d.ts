/**
 * Engine wiring: the native async interpreter from interscript-ts over
 * the assets-backed map loader. No regex compilation, ever.
 */
import { type SystemCode } from "interscript";
import { bundledSystemCodes, type MapAssets } from "./maps.js";
export declare function transliterate(assets: MapAssets, systemCode: string, input: string): Promise<string>;
export declare function detect(assets: MapAssets, input: string, output: string): Promise<{
    mapName: string;
    distance: number;
}[]>;
export { bundledSystemCodes };
export type { SystemCode };
