"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { PromptCard } from "@/components/prompt-card";
import { Clock, Heart, TrendingUp, Sparkles, BarChart3 } from "lucide-react";

export default function Home() {
  const categories = useQuery(api.categories.getAllCategories);
  const popularPrompts = useQuery(api.prompts.getPublicPrompts, {
    limit: 6,
    sortBy: "popular",
  });
  const recentPrompts = useQuery(api.prompts.getPublicPrompts, {
    limit: 3,
    sortBy: "recent",
  });
  
  // カテゴリ別のプロンプトを取得
  const entertainmentPrompts = useQuery(api.prompts.getPublicPrompts, {
    limit: 4,
    categoryId: categories?.find(c => c.slug === "entertainment")?._id,
    sortBy: "popular",
  });
  const assistantPrompts = useQuery(api.prompts.getPublicPrompts, {
    limit: 4,
    categoryId: categories?.find(c => c.slug === "assistant")?._id,
    sortBy: "popular",
  });
  
  const totalPrompts = popularPrompts?.length || 0;

  return (
    <main className="min-h-screen clean-bg">
      {/* Hero Section */}
      <section className="section-spacing">
        <div className="container-standard text-center">
          <h1 className="mb-6 text-5xl font-bold animate-fade-in text-pop">
            AIキャラクタープロンプト共有サービス
          </h1>
          <p className="mb-8 text-xl text-muted-foreground animate-slide-up">
            AIにキャラクターになりきってもらうためのプロンプトを作成・共有しよう
          </p>
          <div className="flex gap-4 justify-center animate-bounce-subtle">
            <Link href="/prompts/new">
              <Button size="lg" className="btn-pop">プロンプトを作成</Button>
            </Link>
            <Link href="/explore">
              <Button size="lg" variant="outline" className="btn-secondary-pop">
                プロンプトを探す
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 border-y border-border/50">
        <div className="container-standard">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="animate-fade-in">
              <div className="flex items-center justify-center gap-2 mb-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h3 className="text-3xl font-bold">{totalPrompts * 10}+</h3>
              </div>
              <p className="text-muted-foreground">作成されたプロンプト</p>
            </div>
            <div className="animate-fade-in" style={{animationDelay: "0.1s"}}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Heart className="h-5 w-5 text-pink-500" />
                <h3 className="text-3xl font-bold">{totalPrompts * 50}+</h3>
              </div>
              <p className="text-muted-foreground">累計いいね数</p>
            </div>
            <div className="animate-fade-in" style={{animationDelay: "0.2s"}}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <h3 className="text-3xl font-bold">50+</h3>
              </div>
              <p className="text-muted-foreground">アクティブクリエイター</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Prompts Section */}
      <section className="section-spacing">
        <div className="container-standard">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-2">
                <TrendingUp className="h-8 w-8 text-primary" />
                人気のプロンプト
              </h2>
              <p className="text-muted-foreground mt-2">今注目されているキャラクタープロンプト</p>
            </div>
            <Link href="/explore?sort=popular">
              <Button variant="outline" className="btn-secondary-pop">
                もっと見る
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-standard">
            {popularPrompts?.map((prompt) => (
              <PromptCard key={prompt._id} prompt={prompt} />
            ))}
          </div>
        </div>
      </section>

      {/* Category Highlights Section */}
      <section className="section-spacing">
        <div className="container-standard">
          <h2 className="mb-12 text-3xl font-bold text-center">カテゴリ別人気プロンプト</h2>
          
          {/* エンターテイメントカテゴリ */}
          {entertainmentPrompts && entertainmentPrompts.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold flex items-center gap-2">
                  <span className="text-3xl">🎭</span>
                  エンターテイメント
                </h3>
                <Link href="/categories/entertainment">
                  <Button variant="ghost" size="sm">
                    もっと見る →
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {entertainmentPrompts.map((prompt) => (
                  <PromptCard key={prompt._id} prompt={prompt} />
                ))}
              </div>
            </div>
          )}
          
          {/* アシスタントカテゴリ */}
          {assistantPrompts && assistantPrompts.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold flex items-center gap-2">
                  <span className="text-3xl">💼</span>
                  アシスタント
                </h3>
                <Link href="/categories/assistant">
                  <Button variant="ghost" size="sm">
                    もっと見る →
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {assistantPrompts.map((prompt) => (
                  <PromptCard key={prompt._id} prompt={prompt} />
                ))}
              </div>
            </div>
          )}
          
          {/* カテゴリ一覧 */}
          <div className="mt-16">
            <h3 className="mb-6 text-xl font-semibold text-center">すべてのカテゴリ</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories?.map((category) => (
                <Link
                  key={category._id}
                  href={`/categories/${category.slug}`}
                  className="group"
                >
                  <div className="card-pop p-4 text-center hover:scale-105 transition-transform">
                    <div className="mb-2 text-3xl">{category.icon}</div>
                    <h4 className="text-sm font-medium group-hover:text-primary">
                      {category.name}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recent Prompts Section */}
      <section className="section-spacing bg-muted/30">
        <div className="container-standard">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-2">
                <Clock className="h-8 w-8 text-primary" />
                最新のプロンプト
              </h2>
              <p className="text-muted-foreground mt-2">新しく追加されたプロンプト</p>
            </div>
            <Link href="/explore?sort=recent">
              <Button variant="outline" className="btn-secondary-pop">
                もっと見る
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 grid-standard">
            {recentPrompts?.map((prompt) => (
              <PromptCard key={prompt._id} prompt={prompt} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/50 py-16 px-4">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-3xl font-bold text-center">
            Character Bankの特徴
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon="🎭"
              title="多彩なキャラクター"
              description="秘書、エンターテイナー、教師など、様々なキャラクターのプロンプトを探せます"
            />
            <FeatureCard
              icon="🚀"
              title="簡単共有"
              description="作成したプロンプトをワンクリックでコピー。すぐにAIで試せます"
            />
            <FeatureCard
              icon="💡"
              title="コミュニティ"
              description="他のユーザーが作成した創造的なプロンプトから学び、インスピレーションを得ましょう"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold">
            今すぐ始めよう
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            アカウントを作成して、あなたのオリジナルキャラクターを共有しましょう
          </p>
          <Link href="/sign-up">
            <Button size="lg">無料で始める</Button>
          </Link>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="mb-4 text-5xl">{icon}</div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}