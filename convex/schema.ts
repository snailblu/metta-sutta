import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  translations: defineTable({
    original: v.string(),
    result: v.string(), // JSON stringified result
    createdAt: v.number(),
  }).index("by_created", ["createdAt"]),
});
