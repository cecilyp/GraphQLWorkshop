import { objectType } from "nexus";

export const Address = objectType({
  name: "Address",
  definition(t) {
    t.nonNull.id("id");
    t.nonNull.string("street");
    t.nonNull.string("city");
    t.nonNull.string("zip");
  },
});
