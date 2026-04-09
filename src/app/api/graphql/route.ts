import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { schema } from "@/graphql/schema";
import { prisma } from "@/lib/prisma";
import type { Context } from "@/graphql/schema/context";
import type { NextRequest } from "next/server";

const server = new ApolloServer<Context>({ schema });

const handler = startServerAndCreateNextHandler<NextRequest, Context>(server, {
  context: async () => ({ prisma }),
});

export { handler as GET, handler as POST };
