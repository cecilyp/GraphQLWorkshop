"use client";

/**
 * WORKSHOP — Mutation + Cache Update Pattern
 *
 * This component owns the "friends" slice of the Person type via its fragment.
 * After addFriend mutates, we have two options for refreshing this list:
 *
 *   Option A (Simple):  refetchQueries: [GET_PERSON_QUERY]
 *     — Re-runs the whole page query. Easy but fetches address data we don't need.
 *
 *   Option B (Gold Standard):  cache.modify()
 *     — Surgically updates only the friends array in the Apollo cache.
 *     — No network round-trip for address/profile data.
 *     — The UI updates instantly.
 *
 * The AddFriendForm below uses Option B. Participants should start with Option A
 * and then refactor to Option B as the workshop's key exercise.
 */

import { FragmentType, useFragment } from "@/gql";
import { graphql } from "@/gql";
import Link from "next/link";

// ─── Fragment Definition ──────────────────────────────────────────────────────
export const FriendsListFragment = graphql(`
  fragment FriendsList on Person {
    friends {
      id
      name
      email
    }
  }
`);

// ─── Component ───────────────────────────────────────────────────────────────
interface Props {
  person: FragmentType<typeof FriendsListFragment>;
}

export function FriendsList({ person }: Props) {
  const data = useFragment(FriendsListFragment, person);
  const friends = data.friends;

  if (friends.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">No friends yet — add some below.</p>
    );
  }

  return (
    <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white shadow-sm">
      {friends.map((friend) => (
        <li key={friend.id} className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="font-medium text-gray-900">{friend.name}</p>
            <p className="text-sm text-gray-500">{friend.email}</p>
          </div>
          <Link
            href={`/person/${friend.id}`}
            className="text-xs text-blue-600 hover:underline"
          >
            View profile →
          </Link>
        </li>
      ))}
    </ul>
  );
}
