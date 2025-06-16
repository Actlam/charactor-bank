import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createPrompt = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    content: v.string(),
    categoryId: v.optional(v.id("categories")),
    tags: v.array(v.string()),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    // Get current user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Validate inputs
    if (args.title.trim().length === 0) {
      throw new Error("Title is required");
    }

    if (args.content.trim().length === 0) {
      throw new Error("Content is required");
    }

    if (args.title.length > 100) {
      throw new Error("Title must be 100 characters or less");
    }

    if (args.description && args.description.length > 500) {
      throw new Error("Description must be 500 characters or less");
    }

    if (args.tags.length > 10) {
      throw new Error("Maximum 10 tags allowed");
    }

    // Create prompt
    const promptId = await ctx.db.insert("prompts", {
      userId: user._id,
      title: args.title.trim(),
      description: args.description?.trim(),
      content: args.content.trim(),
      categoryId: args.categoryId,
      tags: args.tags.map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0),
      isPublic: args.isPublic,
      viewCount: 0,
      likeCount: 0,
      bookmarkCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return promptId;
  },
});

export const getPromptById = query({
  args: { promptId: v.id("prompts") },
  handler: async (ctx, args) => {
    const prompt = await ctx.db.get(args.promptId);
    
    if (!prompt) {
      return null;
    }

    // Get author information
    const author = await ctx.db.get(prompt.userId);
    
    // Get category information if exists
    const category = prompt.categoryId 
      ? await ctx.db.get(prompt.categoryId)
      : null;

    // Check if current user can view this prompt
    const identity = await ctx.auth.getUserIdentity();
    if (!prompt.isPublic) {
      if (!identity) {
        return null;
      }

      const currentUser = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .unique();

      if (!currentUser || currentUser._id !== prompt.userId) {
        return null;
      }
    }

    return {
      ...prompt,
      author,
      category,
    };
  },
});

export const updatePrompt = mutation({
  args: {
    promptId: v.id("prompts"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    content: v.optional(v.string()),
    categoryId: v.optional(v.union(v.id("categories"), v.null())),
    tags: v.optional(v.array(v.string())),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    // Get current user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Get prompt
    const prompt = await ctx.db.get(args.promptId);
    if (!prompt) {
      throw new Error("Prompt not found");
    }

    // Check ownership
    if (prompt.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    // Validate inputs
    if (args.title !== undefined) {
      if (args.title.trim().length === 0) {
        throw new Error("Title is required");
      }
      if (args.title.length > 100) {
        throw new Error("Title must be 100 characters or less");
      }
    }

    if (args.content !== undefined && args.content.trim().length === 0) {
      throw new Error("Content is required");
    }

    if (args.description !== undefined && args.description.length > 500) {
      throw new Error("Description must be 500 characters or less");
    }

    if (args.tags !== undefined && args.tags.length > 10) {
      throw new Error("Maximum 10 tags allowed");
    }

    // Update prompt
    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) updates.title = args.title.trim();
    if (args.description !== undefined) updates.description = args.description.trim();
    if (args.content !== undefined) updates.content = args.content.trim();
    if (args.categoryId !== undefined) updates.categoryId = args.categoryId;
    if (args.tags !== undefined) {
      updates.tags = args.tags.map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0);
    }
    if (args.isPublic !== undefined) updates.isPublic = args.isPublic;

    await ctx.db.patch(args.promptId, updates);
  },
});

export const deletePrompt = mutation({
  args: { promptId: v.id("prompts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    // Get current user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Get prompt
    const prompt = await ctx.db.get(args.promptId);
    if (!prompt) {
      throw new Error("Prompt not found");
    }

    // Check ownership
    if (prompt.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    // Delete related likes and bookmarks
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_prompt", (q) => q.eq("promptId", args.promptId))
      .collect();

    for (const like of likes) {
      await ctx.db.delete(like._id);
    }

    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_prompt", (q) => q.eq("promptId", args.promptId))
      .collect();

    for (const bookmark of bookmarks) {
      await ctx.db.delete(bookmark._id);
    }

    // Delete comments
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_prompt", (q) => q.eq("promptId", args.promptId))
      .collect();

    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    // Delete prompt
    await ctx.db.delete(args.promptId);
  },
});

export const getPublicPrompts = query({
  args: {
    limit: v.optional(v.number()),
    categoryId: v.optional(v.id("categories")),
    sortBy: v.optional(v.union(v.literal("recent"), v.literal("popular"))),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const sortBy = args.sortBy || "recent";

    // Sort by creation date or like count
    let prompts;
    if (sortBy === "popular") {
      prompts = await ctx.db
        .query("prompts")
        .withIndex("by_like_count")
        .order("desc")
        .filter((q) => q.eq(q.field("isPublic"), true))
        .filter((q) => 
          args.categoryId 
            ? q.eq(q.field("categoryId"), args.categoryId)
            : true
        )
        .take(limit);
    } else {
      prompts = await ctx.db
        .query("prompts")
        .withIndex("by_created_at")
        .order("desc")
        .filter((q) => q.eq(q.field("isPublic"), true))
        .filter((q) => 
          args.categoryId 
            ? q.eq(q.field("categoryId"), args.categoryId)
            : true
        )
        .take(limit);
    }

    // Fetch author and category information for each prompt
    const promptsWithDetails = await Promise.all(
      prompts.map(async (prompt) => {
        const author = await ctx.db.get(prompt.userId);
        const category = prompt.categoryId 
          ? await ctx.db.get(prompt.categoryId)
          : null;

        return {
          ...prompt,
          author,
          category,
        };
      })
    );

    return promptsWithDetails;
  },
});

export const searchPrompts = query({
  args: {
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    // Search in titles
    const prompts = await ctx.db
      .query("prompts")
      .withSearchIndex("search_prompts", (q) => 
        q.search("title", args.searchTerm)
          .eq("isPublic", true)
      )
      .take(limit);

    // Fetch author and category information
    const promptsWithDetails = await Promise.all(
      prompts.map(async (prompt) => {
        const author = await ctx.db.get(prompt.userId);
        const category = prompt.categoryId 
          ? await ctx.db.get(prompt.categoryId)
          : null;

        return {
          ...prompt,
          author,
          category,
        };
      })
    );

    return promptsWithDetails;
  },
});

export const getUserPrompts = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    // Get prompts
    let prompts;
    if (identity) {
      const currentUser = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .unique();

      // If viewing own prompts, show all. Otherwise, only public
      if (currentUser && currentUser._id === args.userId) {
        prompts = await ctx.db
          .query("prompts")
          .withIndex("by_user", (q) => q.eq("userId", args.userId))
          .order("desc")
          .collect();
      } else {
        prompts = await ctx.db
          .query("prompts")
          .withIndex("by_user", (q) => q.eq("userId", args.userId))
          .filter((q) => q.eq(q.field("isPublic"), true))
          .order("desc")
          .collect();
      }
    } else {
      // Not authenticated, only show public prompts
      prompts = await ctx.db
        .query("prompts")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .filter((q) => q.eq(q.field("isPublic"), true))
        .order("desc")
        .collect();
    }

    // Fetch category information
    const promptsWithDetails = await Promise.all(
      prompts.map(async (prompt) => {
        const category = prompt.categoryId 
          ? await ctx.db.get(prompt.categoryId)
          : null;

        return {
          ...prompt,
          category,
        };
      })
    );

    return promptsWithDetails;
  },
});