"use client";

/**
 * WORKSHOP — The Gold Standard: One Query Per Page
 *
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  RULE: This file contains exactly ONE useQuery call.        ║
 * ║  Each child component declares its own fragment.            ║
 * ║  The page query composes those fragments via spread (...).  ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Why this matters:
 *   - ONE network request on load (not 3+ parallel requests)
 *   - No loading-flicker between address and friends rendering
 *   - Adding a new field to a component only touches that component's fragment
 *   - Apollo DevTools shows you one clean query tree
 */

import { useQuery } from "@apollo/client";
import { useParams } from "next/navigation";
import { graphql } from "@/gql";
import { AddressDisplay } from "@/components/AddressDisplay";
import { FriendsList } from "@/components/FriendsList";
import { AddFriendForm } from "@/components/AddFriendForm";

// ─── The Single Page Query ────────────────────────────────────────────────────
// This query is COMPOSED from the fragments each component declares.
// The page doesn't specify `address { street city zip }` directly —
// that's AddressDisplay's responsibility via its fragment.
//
// Export this so the "Option A" version of AddFriendForm can reference it
// in refetchQueries (workshop comparison exercise).
export const GET_PERSON_QUERY = graphql(`
  query GetPerson($id: ID!) {
    getPerson(id: $id) {
      id
      name
      email
      # Each fragment is "owned" by the component that renders it.
      # This page just spreads them in — it doesn't repeat those field lists.
      ...AddressFields
      ...FriendsList
    }
  }
`);

// ─── A second query ONLY for the "Add Friend" dropdown ───────────────────────
// We need the list of all people to populate the select menu.
// This is intentionally a separate query because its data is unrelated
// to the person profile — it won't change when we add a friend.
const GET_ALL_PEOPLE_QUERY = graphql(`
  query GetAllPeople {
    # WORKSHOP NOTE: In a real app you'd paginate this. For the workshop,
    # we keep it simple so participants focus on the fragment pattern.
    getPeople {
      id
      name
    }
  }
`);

// ─── Page Component ───────────────────────────────────────────────────────────
export default function PersonPage() {
  const params = useParams();
  const id = params.id as string;

  // ── The ONE query for this page ──────────────────────────────────────────
  const { data, loading, error } = useQuery(GET_PERSON_QUERY, {
    variables: { id },
  });

  const { data: allPeopleData } = useQuery(GET_ALL_PEOPLE_QUERY);

  // ── Loading / Error states ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading person…</p>
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

  if (!data?.getPerson) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Person not found.</p>
      </div>
    );
  }

  const person = data.getPerson;

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      {/* Profile header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{person.name}</h1>
        <p className="mt-1 text-gray-500">{person.email}</p>
      </div>

      <div className="space-y-6">
        {/* ── AddressDisplay ─────────────────────────────────────────────
            Receives `person` as an opaque FragmentType<AddressFieldsFragment>.
            It can ONLY access the fields declared in AddressFieldsFragment.
            If you try to read `person.friends` here, TypeScript will error.
        ──────────────────────────────────────────────────────────────── */}
        <section>
          <AddressDisplay person={person} />
        </section>

        {/* ── FriendsList ────────────────────────────────────────────────
            Same pattern — only sees fields from FriendsListFragment.
            When addFriend updates the cache, THIS component re-renders.
            AddressDisplay does NOT re-render (its data didn't change).
        ──────────────────────────────────────────────────────────────── */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-800">Friends</h2>
          <FriendsList person={person} />
        </section>

        {/* ── AddFriendForm ──────────────────────────────────────────────
            Uses a mutation. The cache update strategy is the workshop's
            key teaching moment — see AddFriendForm.tsx for details.
        ──────────────────────────────────────────────────────────────── */}
        <section>
          <AddFriendForm
            personId={person.id}
            allPeople={allPeopleData?.getPeople ?? []}
          />
        </section>
      </div>
    </main>
  );
}
