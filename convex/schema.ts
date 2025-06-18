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
    // 会話例機能
    examples: v.optional(v.array(v.object({
      id: v.string(),                    // ユニークID
      userMessage: v.string(),           // ユーザーの発言 (最大200文字)
      characterResponse: v.string(),      // キャラクターの返答 (最大500文字)
      scenario: v.optional(v.string()),   // 場面説明 (最大50文字)
      createdAt: v.number(),             // 作成日時
      isHighlighted: v.optional(v.boolean()), // おすすめ例として強調表示
    }))),
    exampleCount: v.optional(v.number()), // 例の数（0-5、集計用）
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
