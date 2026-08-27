/**
 * The API's own webpage — served from the deployed worker at `/` (to
 * browsers, via content negotiation) and at `/docs` (always). Deployed
 * content belongs to the api.interscript.org deployment, not the main
 * website. Self-contained HTML: no external assets, system font stack.
 */
export declare function docsPage(openapiPath: string): string;
