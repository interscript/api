/**
 * Augmentation: the plane loader ships in the next interscript
 * release (interscript-ts#99/#100). Until the dependency bumps, the
 * worker declares the contract it consumes; vitest aliases
 * "interscript/ml" to the local interscript-ts source so tests run
 * the REAL implementation.
 */
declare module "interscript/ml" {
  export interface PlaneTransformOptions {
    preserveDiacritics?: boolean
  }
  export interface PlaneModelLike {
    transform(input: string, opts?: PlaneTransformOptions): Promise<string>
    dispose(): Promise<void>
  }
  export function createPlaneModel(zipBytes: Uint8Array): Promise<PlaneModelLike>
}
