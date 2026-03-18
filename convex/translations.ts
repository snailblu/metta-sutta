import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const save = mutation({
  args: {
    original: v.string(),
    result: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("translations", {
      original: args.original,
      result: args.result,
      createdAt: Date.now(),
    });
  },
});

export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("translations")
      .withIndex("by_created")
      .order("desc")
      .take(limit);
  },
});

export const search = query({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    const translations = await ctx.db.query("translations").collect();
    const lowerQuery = args.query.toLowerCase();
    return translations.filter(
      (t) =>
        t.original.toLowerCase().includes(lowerQuery) ||
        t.result.toLowerCase().includes(lowerQuery)
    );
  },
});
