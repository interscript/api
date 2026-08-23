/**
 * Base URL for model artifacts. Owned here so every provisioner
 * (HTTP fetcher, manifest loader, future IPFS/Bittorrent) reads
 * from the same source. No circular deps.
 *
 * Default points at the jsDelivr mirror of `interscript/ml-models`
 * — works without npm install, edge-cached globally.
 *
 * Override at runtime with `setModelBase()` for self-hosted mirrors,
 * air-gapped envs, or staging deployments.
 */
export declare function setModelBase(url: string): void;
export declare function getModelBase(): string;
//# sourceMappingURL=base.d.ts.map