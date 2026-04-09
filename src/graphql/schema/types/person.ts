import { extendType, idArg, nonNull, objectType } from "nexus";
import type { Context } from "../context";

export const Person = objectType({
  name: "Person",
  definition(t) {
    t.nonNull.id("id");
    t.nonNull.string("name");
    t.nonNull.string("email");

    t.field("address", {
      type: "Address",
      resolve(parent, _args, ctx: Context) {
        return ctx.prisma.address.findUnique({
          where: { personId: parent.id },
        });
      },
    });

    t.nonNull.list.nonNull.field("friends", {
      type: "Person",
      async resolve(parent, _args, ctx: Context) {
        const person = await ctx.prisma.person.findUnique({
          where: { id: parent.id },
          include: {
            friends: true,
            friendOf: true,
          },
        });
        if (!person) return [];
        // Friendship is bidirectional: merge both sides of the relation
        const all = [...person.friends, ...person.friendOf];
        // Deduplicate (a user could appear in both arrays in edge cases)
        return Array.from(new Map(all.map((p) => [p.id, p])).values());
      },
    });
  },
});

export const Query = extendType({
  type: "Query",
  definition(t) {
    t.field("getPerson", {
      type: "Person",
      description:
        "Fetch a person along with their address and friends. This is the single entry-point for the /person/[id] page.",
      args: { id: nonNull(idArg()) },
      resolve(_root, args, ctx: Context) {
        return ctx.prisma.person.findUnique({ where: { id: args.id } });
      },
    });

    t.nonNull.list.nonNull.field("getPeople", {
      type: "Person",
      description: "List all people — used to populate the Add Friend dropdown.",
      resolve(_root, _args, ctx: Context) {
        return ctx.prisma.person.findMany({ orderBy: { name: "asc" } });
      },
    });
  },
});

export const Mutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("addFriend", {
      type: "Person",
      description: "Connect two people as friends. The relationship is bidirectional.",
      args: {
        personId: nonNull(idArg()),
        friendId: nonNull(idArg()),
      },
      async resolve(_root, args, ctx: Context) {
        const { personId, friendId } = args;
        // Update both sides for true bidirectionality
        await ctx.prisma.person.update({
          where: { id: personId },
          data: { friends: { connect: { id: friendId } } },
        });
        return ctx.prisma.person.findUniqueOrThrow({ where: { id: personId } });
      },
    });
  },
});
