export interface ModelMetric {
    name: string;
    value: number;
    source: string;
}
export interface ModelEntry {
    id: string;
    task: "g2p" | "diacritization" | "translit";
    scripts: string[];
    precision: string;
    filename: string | null;
    url: string | null;
    parts: unknown;
    sha256: string | null;
    size: number | null;
    metrics: ModelMetric[];
    parity: {
        samples: number;
        cer_delta: number;
    } | null;
    license: string;
}
export declare function listModels(): ModelEntry[];
export declare function getModel(id: string): ModelEntry | undefined;
export declare const MODELS_INDEX_VERSION: number;
