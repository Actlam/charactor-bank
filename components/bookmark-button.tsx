"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Bookmark, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";

interface BookmarkButtonProps {
  promptId: Id<"prompts">;
  initialBookmarkCount?: number;
  size?: "sm" | "default" | "lg";
  showCount?: boolean;
}

export function BookmarkButton({ 
  promptId, 
  initialBookmarkCount = 0, 
  size = "default",
  showCount = true 
}: BookmarkButtonProps) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [optimisticBookmarked, setOptimisticBookmarked] = useState<boolean | null>(null);
  const [optimisticCount, setOptimisticCount] = useState(initialBookmarkCount);

  const toggleBookmark = useMutation(api.bookmarks.toggleBookmark);
  const isBookmarked = useQuery(api.bookmarks.isBookmarked, { promptId });

  const bookmarked = optimisticBookmarked !== null ? optimisticBookmarked : isBookmarked;

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    
    // Optimistic update
    const newBookmarkedState = !bookmarked;
    setOptimisticBookmarked(newBookmarkedState);
    setOptimisticCount(prev => newBookmarkedState ? prev + 1 : Math.max(0, prev - 1));

    try {
      await toggleBookmark({ promptId });
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticBookmarked(!newBookmarkedState);
      setOptimisticCount(initialBookmarkCount);
      console.error("Failed to toggle bookmark:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={bookmarked ? "default" : "outline"}
      size={size}
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        "gap-1.5 transition-all",
        bookmarked && "text-white"
      )}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Bookmark 
          className={cn(
            "h-4 w-4 transition-all",
            bookmarked && "fill-current"
          )} 
        />
      )}
      {showCount && <span>{optimisticCount}</span>}
    </Button>
  );
}