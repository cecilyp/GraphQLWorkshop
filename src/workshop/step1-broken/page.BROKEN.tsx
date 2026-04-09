"use client";

/**
 * WORKSHOP STEP 1 — The "Broken" State
 *
 * This is an anti-pattern file. DO NOT copy this approach.
 * It exists so participants can see the problem before the solution.
 *
 * Problems with this approach:
 * ┌──────────────────────────────────────────────────────────────────┐
 * │ 1. THREE separate useQuery calls = THREE network requests        │
 * │ 2. Each component renders a loading spinner independently        │
 * │    → visible "flicker" as each query resolves at different times │
 * │ 3. Fields are duplicated across queries (e.g. `id` appears in   │
 * │    PersonQuery, AddressQuery, and FriendsQuery)                  │
 * │ 4. Adding a field requires touching multiple files               │
 * │ 5. Apollo cache has 3 separate query roots to manage             │
 * └──────────────────────────────────────────────────────────────────┘
 *
 * Open the Network tab in DevTools and load this page.
 * Count the GraphQL requests. Then compare to step2-gold-standard.
 */

import { useQuery } from "@apollo/client";
import { gql } from "graphql-tag";

// ❌ PROBLEM: Three separate queries for one page
const GET_PERSON_BASIC = gql`
  query GetPersonBasic($id: ID!) {
    getPerson(id: $id) {
      id
      name
      email
    }
  }
`;

const GET_PERSON_ADDRESS = gql`
  query GetPersonAddress($id: ID!) {
    getPerson(id: $id) {
      id
      address {
        street
        city
        zip
      }
    }
  }
`;

const GET_PERSON_FRIENDS = gql`
  query GetPersonFriends($id: ID!) {
    getPerson(id: $id) {
      id
      friends {
        id
        name
        email
      }
    }
  }
`;

// ❌ PROBLEM: Each "component" fetches its own data
function BrokenAddressSection({ personId }: { personId: string }) {
  // This fires a second network request AFTER the parent already fetched person data.
  const { data, loading } = useQuery(GET_PERSON_ADDRESS, {
    variables: { id: personId },
  });

  if (loading) return <p>Loading address…</p>; // ← loading flicker

  const address = data?.getPerson?.address;
  if (!address) return <p>No address.</p>;

  return (
    <address>
      {address.street}, {address.city} {address.zip}
    </address>
  );
}

function BrokenFriendsSection({ personId }: { personId: string }) {
  // This fires a third network request.
  const { data, loading } = useQuery(GET_PERSON_FRIENDS, {
    variables: { id: personId },
  });

  if (loading) return <p>Loading friends…</p>; // ← another loading flicker

  const friends = data?.getPerson?.friends ?? [];
  return (
    <ul>
      {friends.map((f: { id: string; name: string }) => (
        <li key={f.id}>{f.name}</li>
      ))}
    </ul>
  );
}

// ❌ PROBLEM: The page already fetched `getPerson` but has no address/friends
export default function BrokenPersonPage({ id }: { id: string }) {
  const { data, loading } = useQuery(GET_PERSON_BASIC, { variables: { id } });

  if (loading) return <p>Loading…</p>;

  return (
    <div>
      <h1>{data?.getPerson?.name}</h1>
      {/* These two components each fire their own queries */}
      <BrokenAddressSection personId={id} />
      <BrokenFriendsSection personId={id} />
    </div>
  );
}

/*
 * DISCUSSION QUESTIONS for the workshop:
 *
 * Q: Open the Network tab. How many GraphQL POST requests do you see?
 * A: 3 — one per useQuery call.
 *
 * Q: What happens if the friends list query is slow?
 * A: The page shows "Loading friends…" even after the address has loaded.
 *    The user sees progressive jank instead of a unified loading state.
 *
 * Q: If we add a `country` field to Address, how many files change?
 * A: At minimum 2: GET_PERSON_ADDRESS query + the display component.
 *    In the fragment pattern, it's exactly 1: the AddressDisplay fragment.
 *
 * Q: After calling addFriend, what happens if we do refetchQueries on GET_PERSON_FRIENDS?
 * A: It works, but we're still maintaining 3 separate cache entries. The
 *    fragment approach has one cache entry for the Person with all fields.
 */
