/**
 * ISC loader strategy — fetches .isc source files and feeds them to the
 * ISC parser + converter, producing CompiledMap objects for the runtime.
 *
 *   configure({ strategies: [iscStrategy({ baseUrl: "/maps" })] })
 */
import { parseIsc } from "./parser.js";
import { iscToCompiledMap } from "./converter.js";
import { normaliseMap } from "../loaders.js";
export function iscStrategy(opts) {
    const fetchFn = opts.fetchFn ?? fetch.bind(globalThis);
    return async (code) => {
        let source;
        if (opts.bundled && opts.bundled[code]) {
            source = opts.bundled[code];
        }
        if (!source) {
            try {
                const res = await fetchFn(`${opts.baseUrl}/${code}.isc`);
                if (!res.ok)
                    return undefined;
                source = await res.text();
            }
            catch {
                return undefined;
            }
        }
        const doc = parseIsc(source, `${code}.isc`);
        const json = iscToCompiledMap(doc);
        return normaliseMap(json);
    };
}
/**
 * Synchronous strategy for pre-loaded ISC sources.
 * Use in Node.js (read files from disk) or with bundled sources.
 */
export function iscBundledStrategy(sources) {
    return (code) => {
        const source = sources[code];
        if (!source)
            return undefined;
        const doc = parseIsc(source, `${code}.isc`);
        const json = iscToCompiledMap(doc);
        return normaliseMap(json);
    };
}
//# sourceMappingURL=loader.js.map