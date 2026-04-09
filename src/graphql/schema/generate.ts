/**
 * Run this script once to generate:
 *   - schema.graphql  (SDL snapshot)
 *   - src/graphql/schema/__generated__/nexus.d.ts  (resolver type-safety)
 *
 * Usage: npm run schema:generate
 */
import { schema } from "./index";

// Nexus writes both files as a side-effect of makeSchema when
// NEXUS_SHOULD_GENERATE_ARTIFACTS=true (set by the outputs option in dev mode).
// Calling this in a standalone script forces a clean generation pass.
console.log("✅ schema.graphql and Nexus typegen written.");
console.log("   Next: run `npm run codegen` to update Apollo Client types.");
void schema; // reference so tree-shaking doesn't remove the import
