"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2 } from "lucide-react";

export default function CategoriesPage() {
  const categories = useQuery(api.categories.getAllCategories);

  if (!categories) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-center">カテゴリ一覧</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category._id}
              href={`/categories/${category.slug}`}
              className="group"
            >
              <div className="rounded-lg border p-8 text-center transition-all hover:shadow-lg hover:border-primary">
                <div className="mb-4 text-6xl">{category.icon}</div>
                <h2 className="mb-2 text-2xl font-semibold group-hover:text-primary">
                  {category.name}
                </h2>
                {category.description && (
                  <p className="text-muted-foreground">
                    {category.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}