import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    username: v.string(),
    displayName: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_username", ["username"]),

  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"]),

  prompts: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    content: v.string(),
    categoryId: v.optional(v.id("categories")),
    tags: v.array(v.string()),
    isPublic: v.boolean(),
    viewCount: v.number(),
    likeCount: v.number(),
    bookmarkCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_category", ["categoryId"])
    .index("by_created_at", ["createdAt"])
    .index("by_like_count", ["likeCount"])
    .searchIndex("search_prompts", {
      searchField: "title",
      filterFields: ["userId", "categoryId", "isPublic"],
    }),

  likes: defineTable({
    userId: v.id("users"),
    promptId: v.id("prompts"),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_prompt", ["promptId"])
    .index("by_user_and_prompt", ["userId", "promptId"]),

  bookmarks: defineTable({
    userId: v.id("users"),
    promptId: v.id("prompts"),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_prompt", ["promptId"])
    .index("by_user_and_prompt", ["userId", "promptId"]),

  comments: defineTable({
    userId: v.id("users"),
    promptId: v.id("prompts"),
    content: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prompt", ["promptId"])
    .index("by_user", ["userId"]),
});
