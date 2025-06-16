"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Heart, Eye } from "lucide-react";

export default function Home() {
  const categories = useQuery(api.categories.getAllCategories);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background section-spacing">
        <div className="container-standard text-center">
          <h1 className="mb-6 text-5xl font-bold animate-fade-in">
            AIキャラクタープロンプト共有サービス
          </h1>
          <p className="mb-8 text-xl text-muted-foreground animate-slide-up">
            AIにキャラクターになりきってもらうためのプロンプトを作成・共有しよう
          </p>
          <div className="flex gap-4 justify-center animate-bounce-subtle">
            <Link href="/prompts/new">
              <Button size="lg">プロンプトを作成</Button>
            </Link>
            <Link href="/explore">
              <Button size="lg" variant="outline">
                プロンプトを探す
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section-spacing">
        <div className="container-standard">
          <h2 className="mb-8 text-3xl font-bold text-center">カテゴリ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-standard">
            {categories?.map((category) => (
              <Link
                key={category._id}
                href={`/categories/${category.slug}`}
                className="group"
              >
                <div className="rounded-lg border p-6 card-interactive">
                  <div className="mb-3 text-4xl">{category.icon}</div>
                  <h3 className="mb-2 text-xl font-semibold group-hover:text-primary">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </div>
              </Link>
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