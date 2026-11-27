import type { MapAssets } from "./maps.js";
export declare const API_VERSION = "3.0.0-cloudflare.1";
export declare function setAssets(binding: MapAssets): void;
export declare function setMl(endpoint: string | undefined, token: string | undefined): void;
export declare function requireAssets(): MapAssets;
export declare function info(): Promise<string>;
export declare function systemCodesResolver(): string[];
export declare function transliterateResolver(systemCode: string, input: string): Promise<string>;
export declare function detectResolver(input: string, output: string): Promise<{
    mapName: string;
    distance: number;
}[]>;
