import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    return user;
  },
});

export const createOrUpdateUser = mutation({
  args: {
    username: v.string(),
    displayName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    const now = Date.now();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        username: args.username,
        displayName: args.displayName,
        avatarUrl: args.avatarUrl,
        updatedAt: now,
      });
      return existingUser._id;
    } else {
      const userId = await ctx.db.insert("users", {
        clerkId: identity.subject,
        username: args.username,
        displayName: args.displayName,
        avatarUrl: args.avatarUrl,
        createdAt: now,
        updatedAt: now,
      });
      return userId;
    }
  },
});

export const getUserByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();
    
    return user;
  },
});

export const updateUserProfile = mutation({
  args: {
    displayName: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      ...args,
      updatedAt: Date.now(),
    });
  },
});

export const getUserStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const prompts = await ctx.db
      .query("prompts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isPublic"), true))
      .collect();

    let totalLikes = 0;
    let totalViews = 0;
    let totalBookmarks = 0;

    for (const prompt of prompts) {
      totalLikes += prompt.likeCount;
      totalViews += prompt.viewCount;
      totalBookmarks += prompt.bookmarkCount;
    }

    return {
      promptCount: prompts.length,
      totalLikes,
      totalViews,
      totalBookmarks,
    };
  },
});