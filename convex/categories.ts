import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getAllCategories = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("categories").collect();
  },
});

export const createCategory = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    // Check if slug already exists
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (existing) {
      throw new Error("Category with this slug already exists");
    }

    return await ctx.db.insert("categories", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// Seed some default categories
export const seedCategories = mutation({
  args: {},
  handler: async (ctx) => {
    const categories = [
      {
        name: "アシスタント",
        slug: "assistant",
        description: "秘書、助手、サポート役",
        color: "#3b82f6",
        icon: "💼",
      },
      {
        name: "エンターテイメント",
        slug: "entertainment",
        description: "芸能人、アイドル、エンターテイナー",
        color: "#ec4899",
        icon: "🎭",
      },
      {
        name: "教育・学習",
        slug: "education",
        description: "教師、講師、メンター",
        color: "#10b981",
        icon: "📚",
      },
      {
        name: "キャラクター",
        slug: "character",
        description: "アニメ、ゲーム、創作キャラクター",
        color: "#f59e0b",
        icon: "🎮",
      },
      {
        name: "専門家",
        slug: "expert",
        description: "各分野の専門家、コンサルタント",
        color: "#6366f1",
        icon: "🔬",
      },
      {
        name: "その他",
        slug: "other",
        description: "その他のキャラクター",
        color: "#6b7280",
        icon: "✨",
      },
    ];

    for (const category of categories) {
      const existing = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", category.slug))
        .unique();

      if (!existing) {
        await ctx.db.insert("categories", {
          ...category,
          createdAt: Date.now(),
        });
      }
    }
  },
});