export class InputTooLongError extends Error {
    max;
    constructor(max) {
        super(`Input is too long (max ${max} characters)`);
        this.max = max;
        this.name = "InputTooLongError";
    }
}
export class MapNotFoundError extends Error {
    systemCode;
    constructor(systemCode) {
        // Byte-identical to the Ruby engine's message.
        super(`Couldn't locate ${systemCode}`);
        this.systemCode = systemCode;
        this.name = "MapNotFoundError";
    }
}
