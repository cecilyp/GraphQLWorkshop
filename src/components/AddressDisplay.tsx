"use client";

/**
 * WORKSHOP — Component Fragment Pattern
 *
 * This component OWNS its data requirements via a GraphQL fragment.
 * It does NOT call useQuery. It does NOT know about the parent query.
 *
 * The fragment is defined here, colocated with the component that uses it.
 * The parent page spreads ...AddressFields into its single query, and passes
 * the masked data down. This is "fragment-first" / "data masking".
 *
 * WORKSHOP CHALLENGE:
 *   1. Add a `country` field to the Address model (Prisma + Nexus).
 *   2. Add it to THIS fragment — not the parent query.
 *   3. Run `npm run codegen`. Watch the types update automatically.
 *   4. Notice: you never touched the page query. That's the point.
 */

import { FragmentType, useFragment } from "@/gql";
import { graphql } from "@/gql";

// ─── Fragment Definition ──────────────────────────────────────────────────────
// Declare exactly what this component needs. Nothing more.
export const AddressFieldsFragment = graphql(`
  fragment AddressFields on Person {
    address {
      id
      street
      city
      zip
    }
  }
`);

// ─── Component ───────────────────────────────────────────────────────────────
interface Props {
  // FragmentType<T> is an opaque type — the parent can't accidentally
  // pass raw/mismatched data. useFragment() "unmasks" it below.
  person: FragmentType<typeof AddressFieldsFragment>;
}

export function AddressDisplay({ person }: Props) {
  // useFragment unmasks the data and gives us the typed fields.
  const data = useFragment(AddressFieldsFragment, person);

  if (!data.address) {
    return <p className="text-sm text-gray-500 italic">No address on file.</p>;
  }

  const { street, city, zip } = data.address;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        Address
      </h3>
      <address className="not-italic text-gray-800">
        <p>{street}</p>
        <p>
          {city}, {zip}
        </p>
      </address>
    </div>
  );
}
