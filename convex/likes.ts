import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const toggleLike = mutation({
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

    // Check if already liked
    const existingLike = await ctx.db
      .query("likes")
      .withIndex("by_user_and_prompt", (q) => 
        q.eq("userId", user._id).eq("promptId", args.promptId)
      )
      .unique();

    if (existingLike) {
      // Unlike
      await ctx.db.delete(existingLike._id);
      
      // Update prompt like count
      await ctx.db.patch(args.promptId, {
        likeCount: Math.max(0, prompt.likeCount - 1),
      });
      
      return { liked: false };
    } else {
      // Like
      await ctx.db.insert("likes", {
        userId: user._id,
        promptId: args.promptId,
        createdAt: Date.now(),
      });
      
      // Update prompt like count
      await ctx.db.patch(args.promptId, {
        likeCount: prompt.likeCount + 1,
      });
      
      return { liked: true };
    }
  },
});

export const isLiked = query({
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

    const like = await ctx.db
      .query("likes")
      .withIndex("by_user_and_prompt", (q) => 
        q.eq("userId", user._id).eq("promptId", args.promptId)
      )
      .unique();

    return !!like;
  },
});

export const getUserLikedPrompts = query({
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

    // Get all likes by user
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    // Get prompt details for each like
    const promptsWithDetails = await Promise.all(
      likes.map(async (like) => {
        const prompt = await ctx.db.get(like.promptId);
        if (!prompt || !prompt.isPublic) return null;

        const author = await ctx.db.get(prompt.userId);
        const category = prompt.categoryId 
          ? await ctx.db.get(prompt.categoryId)
          : null;

        return {
          ...prompt,
          author,
          category,
          likedAt: like.createdAt,
        };
      })
    );

    return promptsWithDetails.filter(Boolean);
  },
});