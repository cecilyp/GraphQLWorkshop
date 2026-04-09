"use client";

/**
 * WORKSHOP — The Mutation & Cache Update
 *
 * STEP 1 (Broken): Use refetchQueries with the full GET_PERSON query.
 *   The address & profile data are fetched again for no reason.
 *
 * STEP 2 (Gold Standard): Use cache.modify() to surgically append the new
 *   friend to only the friends[] array in the Apollo cache.
 *
 * Ask participants: "After adding a friend, does Alice's home address change?"
 * The answer is no — so why would we refetch it?
 */

import { useMutation } from "@apollo/client";
import { graphql } from "@/gql";
import { useState } from "react";

// ─── Mutation Definition ──────────────────────────────────────────────────────
const ADD_FRIEND_MUTATION = graphql(`
  mutation AddFriend($personId: ID!, $friendId: ID!) {
    addFriend(personId: $personId, friendId: $friendId) {
      id
      # Request the updated friends list so the cache has data to write back
      friends {
        id
        name
        email
      }
    }
  }
`);

// ─── Component ───────────────────────────────────────────────────────────────
interface Props {
  personId: string;
  allPeople: { id: string; name: string }[];
}

export function AddFriendForm({ personId, allPeople }: Props) {
  const [selectedFriendId, setSelectedFriendId] = useState("");

  // ── OPTION A (Workshop Step 1) ──────────────────────────────────────────
  // Simple but over-fetches. Uncomment this and comment out the useMutation below.
  //
  // import { GET_PERSON_QUERY } from "@/app/person/[id]/page";
  //
  // const [addFriend, { loading, error }] = useMutation(ADD_FRIEND_MUTATION, {
  //   refetchQueries: [{ query: GET_PERSON_QUERY, variables: { id: personId } }],
  // });
  //
  // ── OPTION B (Workshop Step 2 — Gold Standard) ──────────────────────────
  // Surgical cache update. Only the friends list changes in the UI.
  // No extra network trip for address data.
  const [addFriend, { loading, error }] = useMutation(ADD_FRIEND_MUTATION, {
    onCompleted(data) {
      // The mutation already returned the updated friends list.
      // Apollo automatically merges the returned `friends` array into the cache
      // for this Person because it matches the cached object by ID.
      // We just need to invalidate/refresh the specific Person.friends field.
      //
      // Apollo's InMemoryCache normalizes by __typename + id, so writing
      // Person { id, friends } is enough — no manual cache.modify() needed
      // when the mutation response mirrors the cached fields.
      console.log(
        "[Workshop] Cache updated for Person:",
        data.addFriend.id,
        "Friends now:",
        data.addFriend.friends.map((f) => f.name)
      );
    },
  });

  const candidates = allPeople.filter((p) => p.id !== personId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFriendId) return;
    await addFriend({ variables: { personId, friendId: selectedFriendId } });
    setSelectedFriendId("");
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-700">Add a Friend</h3>

      {error && (
        <p className="mb-2 text-sm text-red-600">Error: {error.message}</p>
      )}

      <div className="flex gap-2">
        <select
          value={selectedFriendId}
          onChange={(e) => setSelectedFriendId(e.target.value)}
          className="flex-1 rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        >
          <option value="">Select a person…</option>
          {candidates.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={!selectedFriendId || loading}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Adding…" : "Add Friend"}
        </button>
      </div>

      <p className="mt-2 text-xs text-gray-400">
        Workshop tip: open the Network tab and watch what gets re-fetched.
      </p>
    </form>
  );
}
