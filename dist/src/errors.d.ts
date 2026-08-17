export declare class InputTooLongError extends Error {
    readonly max: number;
    constructor(max: number);
}
export declare class MapNotFoundError extends Error {
    readonly systemCode: string;
    constructor(systemCode: string);
}
