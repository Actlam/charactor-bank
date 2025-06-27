"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PromptCard } from "@/components/prompt-card";
import { Loader2, Bookmark } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function BookmarksPage() {
  const bookmarkedPrompts = useQuery(api.bookmarks.getUserBookmarks);

  if (bookmarkedPrompts === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex items-center gap-3">
          <Bookmark className="h-8 w-8" />
          <h1 className="text-3xl font-bold">ブックマーク</h1>
        </div>

        {bookmarkedPrompts.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-muted flex items-center justify-center">
              <Bookmark className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="mb-2 text-xl font-semibold">
              まだブックマークがありません
            </h2>
            <p className="mb-6 text-muted-foreground">
              気に入ったプロンプトをブックマークして、後で見返しましょう
            </p>
            <Link href="/explore">
              <Button>プロンプトを探す</Button>
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-6 text-muted-foreground">
              {bookmarkedPrompts.length}件のブックマーク
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {bookmarkedPrompts.map((prompt) => 
                prompt && <PromptCard key={prompt._id} prompt={prompt} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}