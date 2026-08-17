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
export const typeDefs = /* GraphQL */ `
  type DetectionResult {
    mapName: String
    distance: Float
  }

  type Query {
    info: String
    systemCodes: [String]
    transliterate(systemCode: String!, input: String!): String
    detect(input: String!, output: String!): [DetectionResult]
  }
`;
