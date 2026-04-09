#!/bin/sh
set -e

echo "→ Pushing Prisma schema..."
npx prisma db push --skip-generate

echo "→ Generating Prisma client..."
npx prisma generate

echo "→ Seeding database with dummy data..."
npm run db:seed

echo "→ Generating Nexus SDL..."
npm run schema:generate

echo "→ Running GraphQL codegen..."
npm run codegen

echo "→ Starting dev server..."
exec npm run dev
