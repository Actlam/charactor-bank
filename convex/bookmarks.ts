import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const toggleBookmark = mutation({
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

    // Check if prompt exists
    const prompt = await ctx.db.get(args.promptId);
    if (!prompt) {
      throw new Error("Prompt not found");
    }

    // Check if already bookmarked
    const existingBookmark = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_and_prompt", (q) => 
        q.eq("userId", user._id).eq("promptId", args.promptId)
      )
      .unique();

    if (existingBookmark) {
      // Remove bookmark
      await ctx.db.delete(existingBookmark._id);
      
      // Update prompt bookmark count
      await ctx.db.patch(args.promptId, {
        bookmarkCount: Math.max(0, prompt.bookmarkCount - 1),
      });
      
      return { bookmarked: false };
    } else {
      // Add bookmark
      await ctx.db.insert("bookmarks", {
        userId: user._id,
        promptId: args.promptId,
        createdAt: Date.now(),
      });
      
      // Update prompt bookmark count
      await ctx.db.patch(args.promptId, {
        bookmarkCount: prompt.bookmarkCount + 1,
      });
      
      return { bookmarked: true };
    }
  },
});

export const isBookmarked = query({
  args: { promptId: v.id("prompts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return false;
    }

    const bookmark = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_and_prompt", (q) => 
        q.eq("userId", user._id).eq("promptId", args.promptId)
      )
      .unique();

    return !!bookmark;
  },
});

export const getUserBookmarks = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    // Get all bookmarks by user
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    // Get prompt details for each bookmark
    const promptsWithDetails = await Promise.all(
      bookmarks.map(async (bookmark) => {
        const prompt = await ctx.db.get(bookmark.promptId);
        if (!prompt || !prompt.isPublic) return null;

        const author = await ctx.db.get(prompt.userId);
        const category = prompt.categoryId 
          ? await ctx.db.get(prompt.categoryId)
          : null;

        return {
          ...prompt,
          author,
          category,
          bookmarkedAt: bookmark.createdAt,
        };
      })
    );

    return promptsWithDetails.filter(Boolean);
  },
});