"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PromptCard } from "@/components/prompt-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Loader2, Search } from "lucide-react";

export default function ExplorePage() {
  const [sortBy, setSortBy] = useState<"recent" | "popular">("recent");
  const [categoryId, setCategoryId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const categories = useQuery(api.categories.getAllCategories);
  
  // Use search if search term exists, otherwise use regular query
  const prompts = useQuery(
    searchTerm 
      ? api.prompts.searchPrompts 
      : api.prompts.getPublicPrompts,
    searchTerm
      ? { searchTerm, limit: 50 }
      : { 
          sortBy, 
          categoryId: categoryId ? (categoryId as any) : undefined,
          limit: 50 
        }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    // The query will automatically update due to searchTerm state change
    setTimeout(() => setIsSearching(false), 500);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryId("");
    setSortBy("recent");
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">プロンプトを探す</h1>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="プロンプトを検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={isSearching}>
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "検索"
              )}
            </Button>
          </form>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <Select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={!!searchTerm}
            >
              <option value="">すべてのカテゴリ</option>
              {categories?.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </Select>

            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "recent" | "popular")}
              disabled={!!searchTerm}
            >
              <option value="recent">新着順</option>
              <option value="popular">人気順</option>
            </Select>

            {(searchTerm || categoryId || sortBy !== "recent") && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
              >
                フィルターをクリア
              </Button>
            )}
          </div>
        </div>

        {/* Results */}
        {prompts === undefined ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : prompts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              {searchTerm 
                ? "検索結果が見つかりませんでした" 
                : "まだプロンプトが投稿されていません"}
            </p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              {searchTerm 
                ? `"${searchTerm}" の検索結果: ${prompts.length}件` 
                : `${prompts.length}件のプロンプト`}
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