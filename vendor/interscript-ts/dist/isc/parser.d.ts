/**
 * ISC parser — recursive descent parser for ISC format.
 *
 * Parses .isc source text into an IscDocument. No external dependencies.
 * Each construct has its own parse method (OCP: new construct = new method).
 *
 * The grammar mirrors the Ruby Parslet grammar in interscript-ruby.
 *
 *   const doc = parseIsc(source, "map.isc")
 *   // doc.systemCode, doc.metadata, doc.tests, doc.stages, ...
 */
import type { IscDocument } from "./types.js";
export declare function parseIsc(source: string, filename?: string): IscDocument;
//# sourceMappingURL=parser.d.ts.map