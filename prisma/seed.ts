import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean slate
  await prisma.address.deleteMany();
  await prisma.person.deleteMany();

  // Create 5 people with addresses
  const alice = await prisma.person.create({
    data: {
      name: "Alice Chen",
      email: "alice@workshop.dev",
      address: {
        create: { street: "123 Apollo Ave", city: "San Francisco", zip: "94102" },
      },
    },
  });

  const bob = await prisma.person.create({
    data: {
      name: "Bob Martinez",
      email: "bob@workshop.dev",
      address: {
        create: { street: "456 GraphQL Blvd", city: "Austin", zip: "78701" },
      },
    },
  });

  const carol = await prisma.person.create({
    data: {
      name: "Carol Johnson",
      email: "carol@workshop.dev",
      address: {
        create: { street: "789 Fragment Lane", city: "New York", zip: "10001" },
      },
    },
  });

  const dave = await prisma.person.create({
    data: {
      name: "Dave Kim",
      email: "dave@workshop.dev",
      address: {
        create: { street: "321 Query Court", city: "Seattle", zip: "98101" },
      },
    },
  });

  const eve = await prisma.person.create({
    data: {
      name: "Eve Okafor",
      email: "eve@workshop.dev",
      address: {
        create: { street: "654 Schema Street", city: "Chicago", zip: "60601" },
      },
    },
  });

  // Wire up some initial friendships
  await prisma.person.update({
    where: { id: alice.id },
    data: { friends: { connect: [{ id: bob.id }, { id: carol.id }] } },
  });

  await prisma.person.update({
    where: { id: bob.id },
    data: { friends: { connect: [{ id: dave.id }] } },
  });

  await prisma.person.update({
    where: { id: carol.id },
    data: { friends: { connect: [{ id: eve.id }] } },
  });

  console.log("✅ Seed complete!");
  console.log(`   People created: alice(${alice.id}), bob(${bob.id}), carol(${carol.id}), dave(${dave.id}), eve(${eve.id})`);
  console.log("\n   Visit these URLs to test:");
  console.log(`   http://localhost:3000/person/${alice.id}`);
  console.log(`   http://localhost:3000/person/${bob.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
