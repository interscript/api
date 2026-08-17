export declare const API_VERSION = "3.0.0-cloudflare.1";
export interface AssetsBinding {
    fetch(url: string): Promise<Response>;
}
export interface Env {
    ASSETS?: AssetsBinding;
}
export declare function setAssets(binding: AssetsBinding): void;
export declare function requireAssets(): AssetsBinding;
export declare function info(): Promise<string>;
export declare function systemCodesResolver(): string[];
export declare function transliterateResolver(systemCode: string, input: string): Promise<string>;
export declare function detectResolver(input: string, output: string): Promise<{
    mapName: string;
    distance: number;
}[]>;
