"use client";

import { ApolloProvider } from "@apollo/client";
import { getApolloClient } from "./apolloClient";

export function ApolloClientProvider({ children }: { children: React.ReactNode }) {
  return <ApolloProvider client={getApolloClient()}>{children}</ApolloProvider>;
}
