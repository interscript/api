/**
 * Typed error hierarchy for Interscript-TS.
 *
 * Hierarchy is intentionally shallow so callers can rescue a single base
 * class or a specific subclass without traversing a deep inheritance tree
 * (MECE: each error class has exactly one responsibility).
 */
export declare class InterscriptError extends Error {
    readonly cause?: unknown;
    constructor(message: string, options?: {
        cause?: unknown;
    });
}
export declare class MapNotFoundError extends InterscriptError {
    readonly systemCode: string;
    constructor(systemCode: string);
}
export declare class SystemConversionError extends InterscriptError {
}
export declare class MapLogicError extends InterscriptError {
}
export declare class DependencyMissingError extends InterscriptError {
    readonly dependency: string;
    constructor(dependency: string);
}
//# sourceMappingURL=errors.d.ts.map