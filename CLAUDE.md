# Character Bank プロジェクト設定

## Instructions for Claude

### Claude の Personality
あなたはファンタジー世界の魔法使い「エリア・ムーンライト」です：

**キャラクター設定：**
- 年齢：19歳
- 種族：エルフ（半人間）
- 外見：銀髪の長髪、青い瞳、賢そうな印象
- 職業：魔法使い（氷と光の魔法が得意）

**性格：**
- 冷静で知的、でも仲間思い
- 本や研究が好きな学者気質
- 真面目だけど、時々天然な一面も
- 困った仲間を放っておけない

**話し方：**
- 丁寧語で落ち着いた話し方
- 「〜ですね」「〜と思われます」
- 魔法の知識を説明する時は詳しく
- 仲間を呼ぶ時は「みなさん」

**得意なこと：**
- 魔法の詠唱と戦術指揮
- モンスターや遺跡の知識
- 古代文字の解読
- 薬草学と回復アイテム作成

**装備：**
- 古代文字が刻まれた魔法の杖
- 魔法書が入った革のカバン
- 青いローブと帽子

**パーティでの役割：**
- 後衛での魔法攻撃とサポート
- 戦略立案と情報収集
- 仲間の体調管理

冒険者として、知識と魔法で仲間を支えてください！


---

## Project Overview

### プラットフォーム概要
Character Bank は AIキャラクタープロンプト共有サービスです。ユーザーがAIに様々なキャラクターになりきってもらうためのプロンプトを作成・共有・発見できるプラットフォームです。

**現在のステータス**: MVP完了（v1.0.0）- 基本CRUD機能実装済み

### 技術スタック
- **Frontend**: Next.js 15.2.3 (App Router) + React 19.0.0 + TypeScript
- **Backend**: Convex 1.23.0 (Serverless Database)
- **Authentication**: Clerk 6.12.6
- **Styling**: Tailwind CSS v4 + CSS Variables (新しい@theme inline構文)
- **UI Components**: カスタムUIコンポーネント（shadcn/ui風デザイン）
- **Testing**: Vitest 3.2.3 + React Testing Library + Coverage + UI
- **Development**: npm-run-all（フロントエンド・バックエンド並列実行）
- **Linting**: ESLint + Prettier

### データベース構造
- **users**: ユーザー情報（Clerk連携）
- **categories**: 6つのカテゴリ（アシスタント、エンターテイメント、教育・学習、キャラクター、専門家、その他）
- **prompts**: プロンプト本体（タイトル、説明、内容、タグ、統計情報）
- **likes**: いいね機能
- **bookmarks**: ブックマーク機能
- **comments**: コメント機能

---

## Development Guidelines

### 開発環境・基本コマンド
```bash
# 開発サーバー起動（フロントエンド・バックエンド並列実行）
npm run dev

# 個別起動
npm run dev:frontend    # Next.js dev server
npm run dev:backend     # Convex dev server

# ビルド・デプロイ
npm run build
npx convex deploy

# データベース確認
npx convex dashboard

# テスト実行
npm test                # vitest実行
npm run test:watch      # watch mode
npm run test:coverage   # カバレッジ付き
npm run test:ui         # UI付きテスト

# Linting
npm run lint            # ESLint実行
```

### ファイル構造・命名規則
```
app/                    # Next.js App Router pages
├── page.tsx           # ホームページ
├── explore/           # 探索ページ
├── prompts/           # プロンプト関連ページ
└── categories/        # カテゴリページ

components/            # Reactコンポーネント
├── ui/               # 基本UIコンポーネント（kebab-case.tsx）
└── *.tsx             # ページ固有コンポーネント

convex/               # バックエンド関数
├── schema.ts         # データベーススキーマ
├── *.ts             # Mutation/Query関数（camelCase）
└── _generated/       # 自動生成ファイル

lib/                  # ユーティリティ
└── utils.ts          # 共通関数

hooks/                # カスタムフック
└── *.ts             # useXxx形式

__tests__/            # テストファイル
└── *.test.tsx        # Vitest + React Testing Library
```

### 実装パターン（頻出）

#### 1. Convex Query/Mutation パターン
```typescript
// Convex Query
export const getPrompts = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db.query("prompts").take(args.limit || 20);
  },
});

// Convex Mutation
export const createPrompt = mutation({
  args: { title: v.string(), content: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("prompts", args);
  },
});
```

#### 2. React Component with Convex
```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function MyComponent() {
  const data = useQuery(api.myTable.getAll);
  const createItem = useMutation(api.myTable.create);
  
  // ...implementation
}
```

#### 3. エラーハンドリング・認証パターン
```typescript
// Convex関数での認証チェック
const identity = await ctx.auth.getUserIdentity();
if (!identity) {
  throw new Error("Unauthenticated");
}

// フロントエンドでのエラーハンドリング
try {
  await createPrompt({ title, content });
} catch (error) {
  console.error("作成に失敗しました:", error);
}
```

### コーディング規約
- **TypeScript**: strict mode必須、any禁止
- **Styling**: Tailwind CSS優先、カスタムCSS最小限
- **Components**: 単一責任の原則、Props型定義必須
- **Functions**: エラーハンドリング必須、レスポンス型統一

---

## Current Sprint & Development Status

### Sprint 1 (6/16 - 6/30): プロフィール機能・CRUD拡張
**優先度**: P0(必須) → P1(高) → P2(中) → P3(低)

#### 進行中のタスク
1. **プロフィール機能** (P0)
   - ユーザープロフィールページ作成
   - プロフィール編集機能
   - ユーザーの投稿したプロンプト一覧

2. **プロンプト管理機能** (P1)
   - 編集・削除機能追加
   - 下書き保存機能
   - プロンプト統計情報（ビュー数、いいね数）

3. **検索・フィルタリング強化** (P1)
   - 高度な検索機能
   - タグベースフィルタリング
   - カテゴリ別ソート

### 技術的負債・注意事項
- **入力値検証**: 統一的なバリデーション仕組み導入必要
- **エラーハンドリング**: グローバルエラー処理機構不足
- **テストカバレッジ**: 現在25%未満、目標80%
- **パフォーマンス**: ページロード時間2秒以内維持
- **セキュリティ**: XSS/CSRF対策、レート制限実装

### 今後のロードマップ
- **Phase 2 (7月)**: ソーシャル機能（フォロー、通知、コメント）
- **Phase 3 (8月)**: AI実行機能（プロンプト直接実行）
- **Phase 4 (9月)**: 高度な分析・レコメンデーション

---

## Quick Reference

### よく使用するConvex関数
```bash
# カテゴリ取得
npx convex run categories:getAllCategories

# プロンプト検索
npx convex run prompts:getPublicPrompts

# サンプルデータ投入
npx convex run categories:seedCategories
npx convex run prompts:seedPrompts
```

### デバッグ・トラブルシューティング
1. **Convex接続エラー**: `npx convex dev` で開発サーバー確認
2. **認証エラー**: Clerk設定とenvファイル確認
3. **ビルドエラー**: TypeScript型エラーとlint確認
4. **スタイルエラー**: Tailwind CSS設定確認

### 成功指標・KPI
- **ユーザー数**: MAU 1,000人（3ヶ月後目標）
- **パフォーマンス**: ページロード2秒以内
- **可用性**: 99.9%維持
- **品質**: テストカバレッジ80%以上


## Playwright MCP使用ルール

### 絶対的な禁止事項

1. **いかなる形式のコード実行も禁止**

   - Python、JavaScript、Bash等でのブラウザ操作
   - MCPツールを調査するためのコード実行
   - subprocessやコマンド実行によるアプローチ

2. **利用可能なのはMCPツールの直接呼び出しのみ**

   - playwright:browser_navigate
   - playwright:browser_screenshot
   - 他のPlaywright MCPツール

3. **エラー時は即座に報告**
   - 回避策を探さない
   - 代替手段を実行しない
   - エラーメッセージをそのまま伝える