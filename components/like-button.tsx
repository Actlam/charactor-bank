"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import { Id } from "@/convex/_generated/dataModel";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { AuthenticationError, NetworkError } from "@/lib/errors";
import { toast } from "sonner";

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
  const { handleError } = useErrorHandler({
    showToast: true,
    redirectOnAuth: true,
    context: { promptId: promptId as string, action: 'like' },
  });
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
      handleError(new AuthenticationError("いいねするにはログインが必要です"));
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
      
      // 成功メッセージ
      if (newLikedState) {
        toast.success("いいねしました");
      } else {
        toast.success("いいねを取り消しました");
      }
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticLiked(!newLikedState);
      setOptimisticCount(initialLikeCount);
      
      // エラーハンドリング
      if (error instanceof Error && error.message.includes('fetch')) {
        handleError(new NetworkError("ネットワークエラーが発生しました"));
      } else {
        handleError(error as Error);
      }
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