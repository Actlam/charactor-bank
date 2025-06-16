"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useStoreUser() {
  const { user, isSignedIn } = useUser();
  const createOrUpdateUser = useMutation(api.users.createOrUpdateUser);

  useEffect(() => {
    if (isSignedIn && user) {
      createOrUpdateUser({
        username: user.username || user.id,
        displayName: user.fullName || undefined,
        avatarUrl: user.imageUrl || undefined,
      }).catch(console.error);
    }
  }, [isSignedIn, user, createOrUpdateUser]);
}