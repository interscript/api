/**
 * GraphQL schema — field-for-field identical to the deployed Ruby API
 * (graphql-ruby camelizes field/argument names):
 *
 *   info: String
 *   systemCodes: [String]
 *   transliterate(systemCode: String!, input: String!): String
 *   detect(input: String!, output: String!): [DetectionResult]
 *     DetectionResult { mapName: String, distance: Float }
 *
 * Error strings match the Ruby implementation so clients see identical
 * behavior across the cutover ("Couldn't locate <system_code>").
 */
export declare const typeDefs = "\n  type DetectionResult {\n    mapName: String\n    distance: Float\n  }\n\n  type Query {\n    info: String\n    systemCodes: [String]\n    transliterate(systemCode: String!, input: String!): String\n    detect(input: String!, output: String!): [DetectionResult]\n  }\n";
