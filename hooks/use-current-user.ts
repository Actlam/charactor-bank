"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useCurrentUser() {
  const { user: clerkUser, isSignedIn, isLoaded } = useUser();
  const convexUser = useQuery(api.users.getCurrentUser);

  // ローディング中
  if (!isLoaded) {
    return { user: null, isLoading: true };
  }

  // サインインしていない
  if (!isSignedIn || !clerkUser) {
    return { user: null, isLoading: false };
  }

  // Convexユーザーがまだ作成されていない場合でも、Clerkユーザー情報を返す
  const username = convexUser?.username || clerkUser.username || clerkUser.id;
  
  return {
    user: {
      ...convexUser,
      username,
      displayName: convexUser?.displayName || clerkUser.fullName,
      avatarUrl: convexUser?.avatarUrl || clerkUser.imageUrl,
      email: clerkUser.primaryEmailAddress?.emailAddress,
      clerkId: clerkUser.id,
    },
    isLoading: false,
  };
}