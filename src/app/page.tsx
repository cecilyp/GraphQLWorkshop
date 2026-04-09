"use client";

import { useQuery } from "@apollo/client";
import { graphql } from "@/gql";
import Link from "next/link";

const GET_ALL_PEOPLE = graphql(`
  query GetAllPeopleHome {
    getPeople {
      id
      name
      email
    }
  }
`);

export default function HomePage() {
  const { data, loading, error } = useQuery(GET_ALL_PEOPLE);

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold">GraphQL Workshop</h1>
      <p className="mb-8 text-gray-500">
        Fragment-driven architecture with Apollo Client + Next.js App Router
      </p>

      <h2 className="mb-4 text-lg font-semibold">People</h2>

      {loading && <p className="text-gray-400">Loading…</p>}
      {error && <p className="text-red-500">Error: {error.message}</p>}

      <ul className="space-y-2">
        {data?.getPeople.map((person) => (
          <li key={person.id}>
            <Link
              href={`/person/${person.id}`}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm hover:border-blue-400 hover:shadow-md transition-all"
            >
              <div>
                <p className="font-medium">{person.name}</p>
                <p className="text-sm text-gray-500">{person.email}</p>
              </div>
              <span className="text-blue-600">View profile →</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
