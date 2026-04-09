import { makeSchema } from "nexus";
import path from "path";
import { Address } from "./types/address";
import { Person, Query, Mutation } from "./types/person";

export const schema = makeSchema({
  types: [Address, Person, Query, Mutation],

  // Nexus will write the SDL and TypeScript types during `npm run schema:generate`
  outputs: {
    schema: path.join(process.cwd(), "schema.graphql"),
    typegen: path.join(process.cwd(), "src/graphql/schema/__generated__/nexus.d.ts"),
  },

  // Auto-bind Prisma types to Nexus source types (eliminates N+1 boilerplate)
  sourceTypes: {
    modules: [
      {
        module: "@prisma/client",
        alias: "prisma",
      },
    ],
  },

  // Point Nexus at the context type so resolvers are type-safe
  contextType: {
    module: path.join(process.cwd(), "src/graphql/schema/context.ts"),
    export: "Context",
  },
});
