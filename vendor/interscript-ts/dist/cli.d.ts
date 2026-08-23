#!/usr/bin/env node
/**
 * interscript-ts CLI — transliteration power tool.
 *
 * Subcommands:
 *   interscript-ts transliterate <systemCode> [options]   (alias: t)
 *   interscript-ts batch <systemCode> <inputFile>         (alias: b)
 *   interscript-ts list                                    (alias: l)
 *   interscript-ts detect <input> <output>                 (alias: d)
 *
 * Global options:
 *   --maps-dir <dir>     Directory containing <systemCode>.json IR files
 *   --http <url>         Load maps from HTTP base URL (default /maps)
 *   --no-cache           Skip persistent cache (HTTP loader)
 *   -h, --help           Show this help
 *
 * Examples:
 *   echo "Антон" | interscript-ts t bgnpcgn-ukr-Cyrl-Latn-2019
 *   interscript-ts t bgnpcgn-ukr-Cyrl-Latn-2019 -i input.txt -o output.txt
 *   interscript-ts batch bgnpcgn-ukr-Cyrl-Latn-2019 names.txt --csv
 *   interscript-ts list --authority bgnpcgn --source-script Cyrl
 *   interscript-ts detect "Антон" "Anton" --maps-dir ./ir
 */
export {};
//# sourceMappingURL=cli.d.ts.map