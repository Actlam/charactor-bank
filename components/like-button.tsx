"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";

interface LikeButtonProps {
  promptId: Id<"prompts">;
  initialLikeCount?: number;
  size?: "sm" | "default" | "lg";
  showCount?: boolean;
}

export function LikeButton({ 
  promptId, 
  initialLikeCount = 0, 
  size = "default",
  showCount = true 
}: LikeButtonProps) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [optimisticLiked, setOptimisticLiked] = useState<boolean | null>(null);
  const [optimisticCount, setOptimisticCount] = useState(initialLikeCount);

  const toggleLike = useMutation(api.likes.toggleLike);
  const isLiked = useQuery(api.likes.isLiked, { promptId });

  const liked = optimisticLiked !== null ? optimisticLiked : isLiked;

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
    const newLikedState = !liked;
    setOptimisticLiked(newLikedState);
    setOptimisticCount(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1));

    try {
      await toggleLike({ promptId });
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticLiked(!newLikedState);
      setOptimisticCount(initialLikeCount);
      console.error("Failed to toggle like:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={liked ? "default" : "outline"}
      size={size}
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        "gap-1.5 transition-all",
        liked && "text-white"
      )}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart 
          className={cn(
            "h-4 w-4 transition-all",
            liked && "fill-current"
          )} 
        />
      )}
      {showCount && <span>{optimisticCount}</span>}
    </Button>
  );
}