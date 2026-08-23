/**
 * ISC document types — mirror the Ruby document hash shape.
 *
 * These types represent the PARSED ISC document, not the runtime
 * CompiledMap. A converter (iscToCompiledMap) bridges the two.
 */
export class IscParseError extends Error {
    position;
    line;
    col;
    constructor(message, position, line, col) {
        super(`ISC parse error at line ${line}:${col}: ${message}`);
        this.position = position;
        this.line = line;
        this.col = col;
        this.name = "IscParseError";
    }
}
//# sourceMappingURL=types.js.map