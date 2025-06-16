# 実装ガイド

このガイドは、Character Bankプロジェクトでの実装時に参照すべきパターンとコマンドをまとめたものです。

## 🚀 よく使うコマンド

### 開発環境
```bash
# 開発サーバー起動（フロントエンド + バックエンド）
npm run dev

# フロントエンドのみ
npm run dev:frontend

# バックエンドのみ（Convex）
npm run dev:backend

# ビルド
npm run build

# 本番環境へのデプロイ
npm run deploy
```

### テスト・品質管理
```bash
# テスト実行
npm test

# テスト（ウォッチモード）
npm run test:watch

# テストカバレッジ
npm run test:coverage

# リント実行
npm run lint

# 型チェック
npm run typecheck

# フォーマット
npm run format
```

### Convex CLI
```bash
# Convex関数の実行（開発環境）
npx convex run <function_name>

# データベースの確認
npx convex dashboard

# ログの確認
npx convex logs
```

## 📁 ファイル・フォルダ命名規則

### ファイル名
```
コンポーネント: kebab-case.tsx
  例: prompt-card.tsx, user-profile.tsx

ページ: page.tsx（Next.js App Router）
  例: app/prompts/[id]/page.tsx

レイアウト: layout.tsx
  例: app/(auth)/layout.tsx

Convex関数: camelCase.ts
  例: prompts.ts, users.ts

フック: use-*.ts
  例: use-auth.ts, use-prompts.ts

ユーティリティ: kebab-case.ts
  例: format-date.ts, validate-input.ts

型定義: types.ts または *.types.ts
  例: prompt.types.ts
```

### フォルダ構造
```
app/
  (auth)/          # 認証が必要なページグループ
  api/             # APIルート
  [dynamic]/       # 動的ルート
components/
  ui/              # shadcn/uiコンポーネント
  forms/           # フォーム関連
  layouts/         # レイアウト関連
convex/
  _generated/      # 自動生成（触らない）
  *.ts            # サーバー関数
```

## 🔨 頻出実装パターン

### Convex Mutation（作成）
```typescript
import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const createPrompt = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // 認証チェック
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // データ作成
    const promptId = await ctx.db.insert("prompts", {
      ...args,
      authorId: identity.subject,
      authorName: identity.name || "Anonymous",
      createdAt: Date.now(),
      likeCount: 0,
      viewCount: 0,
    });

    return promptId;
  },
});
```

### Convex Query（取得）
```typescript
import { v } from "convex/values";
import { query } from "./_generated/server";

export const getPrompt = query({
  args: { promptId: v.id("prompts") },
  handler: async (ctx, args) => {
    const prompt = await ctx.db.get(args.promptId);
    
    if (!prompt) {
      return null;
    }

    // 関連データの取得
    const author = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), prompt.authorId))
      .first();

    return {
      ...prompt,
      author,
    };
  },
});
```

### Convex Query with Index
```typescript
export const getPromptsByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const prompts = await ctx.db
      .query("prompts")
      .withIndex("by_author", (q) => q.eq("authorId", args.userId))
      .order("desc")
      .collect();

    return prompts;
  },
});
```

### React Component with Convex
```typescript
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function PromptList() {
  // データ取得
  const prompts = useQuery(api.prompts.getAll);
  
  // Mutation
  const createPrompt = useMutation(api.prompts.create);

  // ローディング状態
  if (prompts === undefined) {
    return <div>Loading...</div>;
  }

  // エラーハンドリング
  if (prompts === null) {
    return <div>Error loading prompts</div>;
  }

  return (
    <div>
      {prompts.map((prompt) => (
        <PromptCard key={prompt._id} prompt={prompt} />
      ))}
    </div>
  );
}
```

### フォームハンドリング
```typescript
"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function CreatePromptForm() {
  const router = useRouter();
  const createPrompt = useMutation(api.prompts.create);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      const promptId = await createPrompt({
        title: formData.get("title") as string,
        content: formData.get("content") as string,
        category: formData.get("category") as string,
        tags: (formData.get("tags") as string).split(",").map(t => t.trim()),
      });

      toast.success("プロンプトを作成しました");
      router.push(`/prompts/${promptId}`);
    } catch (error) {
      toast.error("エラーが発生しました");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* フォーム要素 */}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "作成中..." : "作成"}
      </button>
    </form>
  );
}
```

### 認証が必要なページ
```typescript
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div>
      {/* 認証済みユーザーのみ表示 */}
    </div>
  );
}
```

### エラーバウンダリー
```typescript
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h2 className="text-2xl font-bold mb-4">エラーが発生しました</h2>
      <p className="text-muted-foreground mb-4">
        申し訳ございません。問題が発生しました。
      </p>
      <Button onClick={reset}>もう一度試す</Button>
    </div>
  );
}
```

### ローディングスケルトン
```typescript
import { Skeleton } from "@/components/ui/skeleton";

export function PromptCardSkeleton() {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  );
}
```

## 🎨 スタイリングパターン

### Tailwind CSS クラス組み合わせ
```typescript
import { cn } from "@/lib/utils";

interface ButtonProps {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Button({ variant = "primary", size = "md", className }: ButtonProps) {
  return (
    <button
      className={cn(
        // ベーススタイル
        "inline-flex items-center justify-center rounded-md font-medium transition-colors",
        // バリアント
        {
          "bg-primary text-primary-foreground hover:bg-primary/90": variant === "primary",
          "bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === "secondary",
        },
        // サイズ
        {
          "h-8 px-3 text-sm": size === "sm",
          "h-10 px-4": size === "md",
          "h-12 px-6 text-lg": size === "lg",
        },
        // カスタムクラス
        className
      )}
    >
      {children}
    </button>
  );
}
```

### レスポンシブデザイン
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* モバイル: 1列, タブレット: 2列, デスクトップ: 3列 */}
</div>

<div className="px-4 sm:px-6 lg:px-8">
  {/* パディングがデバイスサイズに応じて変化 */}
</div>
```

## 🧪 テストパターン

### コンポーネントテスト
```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PromptCard } from "./prompt-card";

describe("PromptCard", () => {
  const mockPrompt = {
    _id: "1",
    title: "Test Prompt",
    content: "Test content",
    likeCount: 10,
  };

  it("displays prompt information", () => {
    render(<PromptCard prompt={mockPrompt} />);
    
    expect(screen.getByText("Test Prompt")).toBeInTheDocument();
    expect(screen.getByText("Test content")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("handles like button click", async () => {
    const user = userEvent.setup();
    const onLike = vi.fn();
    
    render(<PromptCard prompt={mockPrompt} onLike={onLike} />);
    
    await user.click(screen.getByRole("button", { name: /like/i }));
    
    expect(onLike).toHaveBeenCalledWith("1");
  });
});
```

## 🐛 デバッグTips

### Convexデバッグ
```typescript
// サーバー側でのログ
export const debugQuery = query({
  handler: async (ctx) => {
    console.log("Debug info:", {
      auth: await ctx.auth.getUserIdentity(),
      timestamp: new Date().toISOString(),
    });
    
    // データベースの状態を確認
    const count = await ctx.db.query("prompts").count();
    console.log("Total prompts:", count);
  },
});
```

### React DevTools活用
```typescript
// コンポーネントに表示名を設定
PromptCard.displayName = "PromptCard";

// デバッグ用のprops表示
if (process.env.NODE_ENV === "development") {
  console.log("PromptCard props:", props);
}
```

## 📋 チェックリスト

### 新機能実装時
- [ ] Convexスキーマの更新が必要か確認
- [ ] 必要なインデックスを追加したか
- [ ] エラーハンドリングを実装したか
- [ ] ローディング状態を考慮したか
- [ ] モバイル表示を確認したか
- [ ] アクセシビリティを考慮したか
- [ ] テストを作成したか

### PR提出前
- [ ] `npm run lint` でエラーがないか
- [ ] `npm run typecheck` で型エラーがないか
- [ ] `npm test` でテストが通るか
- [ ] 不要なconsole.logを削除したか
- [ ] コミットメッセージが規約に従っているか

---

**最終更新**: 2025-06-16