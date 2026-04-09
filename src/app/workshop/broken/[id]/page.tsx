"use client";

/**
 * WORKSHOP STEP 1 — The "Broken" State
 *
 * This is an anti-pattern. DO NOT copy this approach.
 * It exists so participants can feel the pain before seeing the solution.
 *
 * Problems demonstrated here:
 * ┌──────────────────────────────────────────────────────────────────┐
 * │ 1. THREE separate useQuery calls = THREE network requests        │
 * │ 2. Each component renders a loading spinner independently        │
 * │    → visible "flicker" as each query resolves at different times │
 * │ 3. Fields are duplicated across queries (e.g. `id` appears in   │
 * │    all three queries)                                            │
 * │ 4. Adding a field requires touching multiple files               │
 * │ 5. Apollo cache has 3 separate query roots to manage             │
 * └──────────────────────────────────────────────────────────────────┘
 *
 * Open the Network tab in DevTools and load this page.
 * Count the GraphQL requests. Then compare to /person/[id].
 */

import { useQuery } from "@apollo/client";
import { useParams } from "next/navigation";
import { gql } from "graphql-tag";
import Link from "next/link";

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

// ❌ PROBLEM: Each component fetches its own data independently
function BrokenAddressSection({ personId }: { personId: string }) {
  const { data, loading } = useQuery(GET_PERSON_ADDRESS, {
    variables: { id: personId },
  });

  if (loading) return <p className="text-gray-400 italic">Loading address…</p>; // ← loading flicker

  const address = data?.getPerson?.address;
  if (!address) return <p className="text-gray-400">No address.</p>;

  return (
    <address className="not-italic text-gray-700">
      {address.street}, {address.city} {address.zip}
    </address>
  );
}

function BrokenFriendsSection({ personId }: { personId: string }) {
  const { data, loading } = useQuery(GET_PERSON_FRIENDS, {
    variables: { id: personId },
  });

  if (loading) return <p className="text-gray-400 italic">Loading friends…</p>; // ← another loading flicker

  const friends = data?.getPerson?.friends ?? [];
  if (friends.length === 0) return <p className="text-gray-400">No friends yet.</p>;

  return (
    <ul className="space-y-1">
      {friends.map((f: { id: string; name: string; email: string }) => (
        <li key={f.id} className="text-gray-700">
          {f.name} — <span className="text-gray-400">{f.email}</span>
        </li>
      ))}
    </ul>
  );
}

// ❌ PROBLEM: Page already fetches getPerson but has no address/friends —
// so child components each fire their own extra request
export default function BrokenPersonPage() {
  const params = useParams();
  const id = params.id as string;

  const { data, loading, error } = useQuery(GET_PERSON_BASIC, {
    variables: { id },
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-600">Error: {error.message}</p>
      </div>
    );
  }

  const person = data?.getPerson;
  if (!person) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Person not found.</p>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      {/* Workshop banner */}
      <div className="mb-8 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        <strong>⚠ Anti-pattern demo</strong> — open the Network tab and count the GraphQL requests.{" "}
        <Link href={`/person/${id}`} className="underline font-medium">
          Compare to the gold standard →
        </Link>
      </div>

      {/* Profile header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{person.name}</h1>
        <p className="mt-1 text-gray-500">{person.email}</p>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="mb-2 text-lg font-semibold text-gray-800">Address</h2>
          {/* ❌ Fires a second network request */}
          <BrokenAddressSection personId={id} />
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-gray-800">Friends</h2>
          {/* ❌ Fires a third network request */}
          <BrokenFriendsSection personId={id} />
        </section>
      </div>
    </main>
  );
}
