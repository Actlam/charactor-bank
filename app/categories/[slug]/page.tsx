"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PromptCard } from "@/components/prompt-card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Select } from "@/components/ui/select";
import { Id } from "@/convex/_generated/dataModel";

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [sortBy, setSortBy] = useState<"recent" | "popular">("recent");

  // Get all categories to find the one with matching slug
  const categories = useQuery(api.categories.getAllCategories);
  const category = categories?.find((cat) => cat.slug === slug);

  // Get prompts for this category
  const prompts = useQuery(
    api.prompts.getPublicPrompts,
    category ? { 
      categoryId: category._id as Id<"categories">,
      sortBy,
      limit: 50 
    } : "skip"
  );

  if (!categories) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold">カテゴリが見つかりません</h1>
            <p className="mb-8 text-muted-foreground">
              指定されたカテゴリは存在しません。
            </p>
            <Link href="/explore">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                プロンプト一覧に戻る
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/explore">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              すべてのプロンプト
            </Button>
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{category.icon}</span>
            <div>
              <h1 className="text-3xl font-bold">{category.name}</h1>
              {category.description && (
                <p className="text-muted-foreground">{category.description}</p>
              )}
            </div>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-4">
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "recent" | "popular")}
            >
              <option value="recent">新着順</option>
              <option value="popular">人気順</option>
            </Select>
          </div>
        </div>

        {/* Prompts */}
        {prompts === undefined ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : prompts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              このカテゴリにはまだプロンプトが投稿されていません
            </p>
            <Link href="/prompts/new">
              <Button className="mt-4">
                最初のプロンプトを投稿する
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              {prompts.length}件のプロンプト
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {prompts.map((prompt) => (
                <PromptCard key={prompt._id} prompt={prompt} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}