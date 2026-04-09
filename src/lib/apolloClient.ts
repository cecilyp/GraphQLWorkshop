import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

// getApolloClient() returns a singleton on the client side.
// For SSR, a new instance is created per request (not used in this workshop,
// which is purely client-side fetched for clarity).
let client: ApolloClient<unknown> | null = null;

export function getApolloClient() {
  if (typeof window === "undefined") {
    // SSR: always create a fresh client
    return createClient();
  }
  if (!client) {
    client = createClient();
  }
  return client;
}

function createClient() {
  return new ApolloClient({
    link: new HttpLink({ uri: "/api/graphql" }),
    cache: new InMemoryCache(),
    connectToDevTools: true,
  });
}
