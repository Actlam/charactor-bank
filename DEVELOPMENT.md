# 開発ガイド

## 🚀 開発環境のセットアップ

### 前提条件
- Node.js 18.0.0以上
- npm または yarn
- Clerkアカウント（認証用）

### 初回セットアップ

1. **依存関係のインストール**
   ```bash
   npm install
   ```

2. **環境変数の設定**
   ```bash
   cp .env.local.example .env.local
   ```
   
   以下の環境変数を設定：
   ```env
   # Convex
   NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:3210
   CONVEX_DEPLOY_KEY=your_deploy_key

   # Clerk
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
   CLERK_SECRET_KEY=your_secret_key
   CLERK_JWT_ISSUER_DOMAIN=https://your-domain.clerk.accounts.dev
   ```

3. **Clerk JWTテンプレートの作成**
   - Clerk Dashboardにアクセス
   - JWT Templates → New template
   - Name: `convex`

4. **開発サーバーの起動**
   ```bash
   npm run dev
   ```

---

## 🏗️ プロジェクト構成

```
charactor-bank/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 認証関連ページ
│   ├── bookmarks/         # ブックマーク機能
│   ├── categories/        # カテゴリ機能
│   ├── explore/           # プロンプト一覧
│   ├── likes/             # いいね機能
│   ├── prompts/           # プロンプト機能
│   └── globals.css        # グローバルスタイル
├── components/            # 再利用可能コンポーネント
│   ├── ui/               # shadcn/ui コンポーネント
│   └── *.tsx             # カスタムコンポーネント
├── convex/               # バックエンド（Convex）
│   ├── _generated/       # 自動生成ファイル
│   ├── schema.ts         # データベーススキーマ
│   └── *.ts             # サーバー関数
├── hooks/                # カスタムHooks
├── lib/                  # ユーティリティ関数
└── __tests__/            # テストファイル
```

---

## 🔧 開発コマンド

```bash
# 開発サーバー起動（フロントエンド + バックエンド）
npm run dev

# フロントエンドのみ
npm run dev:frontend

# バックエンドのみ
npm run dev:backend

# ビルド
npm run build

# テスト実行
npm test

# テスト（ウォッチモード）
npm run test:watch

# テスト（カバレッジ付き）
npm run test:coverage

# テストUI
npm run test:ui

# リント
npm run lint
```

---

## 📁 新機能追加の手順

### 1. 新しいページの追加

1. **ページコンポーネント作成**
   ```bash
   # 例：ユーザープロフィールページ
   touch app/users/[username]/page.tsx
   ```

2. **必要に応じてレイアウト追加**
   ```bash
   touch app/users/[username]/layout.tsx
   ```

3. **ルーティングテスト**
   - ブラウザで動作確認
   - 必要に応じてミドルウェア設定

### 2. 新しいConvex関数の追加

1. **関数ファイル作成**
   ```bash
   touch convex/newFeature.ts
   ```

2. **関数の実装**
   ```typescript
   import { v } from "convex/values";
   import { mutation, query } from "./_generated/server";

   export const newFunction = query({
     args: { /* 引数定義 */ },
     handler: async (ctx, args) => {
       // 実装
     },
   });
   ```

3. **型安全性の確認**
   ```bash
   # Convexサーバーを再起動して型を更新
   npm run dev:backend
   ```

### 3. 新しいコンポーネントの追加

1. **コンポーネント作成**
   ```bash
   touch components/new-component.tsx
   ```

2. **shadcn/ui コンポーネントの追加**
   ```bash
   # 例：Dialog コンポーネント
   npx shadcn@latest add dialog
   ```

3. **テスト作成**
   ```bash
   touch __tests__/components/new-component.test.tsx
   ```

---

## 🧪 テスト戦略

### ユニットテスト
- **対象**: 個別の関数・コンポーネント
- **ツール**: Vitest + Testing Library
- **場所**: `__tests__/` ディレクトリ

### 統合テスト
- **対象**: 複数コンポーネントの連携
- **ツール**: Vitest + Testing Library
- **例**: フォーム送信フロー全体

### E2Eテスト（今後追加予定）
- **対象**: ユーザーの操作フロー全体
- **ツール**: Playwright

---

## 📊 データベース設計

### 主要テーブル

1. **users** - ユーザー情報
2. **prompts** - プロンプト本体
3. **categories** - カテゴリ分類
4. **likes** - いいね関係
5. **bookmarks** - ブックマーク関係
6. **comments** - コメント（今後追加）

### インデックス戦略
- `by_user` - ユーザー別検索用
- `by_category` - カテゴリ別検索用
- `by_created_at` - 新着順ソート用
- `by_like_count` - 人気順ソート用
- `search_prompts` - 全文検索用

---

## 🔐 セキュリティ考慮事項

### 認証・認可
- Clerkによる認証
- Convexでの認可チェック
- プライベートプロンプトのアクセス制御

### 入力値検証
- フロントエンド: フォームバリデーション
- バックエンド: Convex values による型検証
- XSS対策: 適切なエスケープ処理

### レート制限
- 今後実装予定
- API呼び出し頻度の制限

---

## 🚀 デプロイメント

### ステージング環境
- Convex: 本番環境とは別のデプロイメント
- Vercel: プレビューデプロイメント

### 本番環境
- Convex: 本番デプロイメント
- Vercel: 本番ドメイン

### デプロイ手順
1. `convex deploy` でバックエンドデプロイ
2. Vercelで自動デプロイ（GitHubプッシュ時）

---

## 📝 コーディング規約

### TypeScript
- 厳密な型定義を使用
- `any` の使用は最小限に
- インターフェースの適切な使用

### React
- 関数コンポーネントを使用
- カスタムHooksの活用
- 適切なメモ化（useMemo, useCallback）

### スタイリング
- Tailwind CSS使用
- shadcn/ui コンポーネント活用
- レスポンシブデザイン必須

### 命名規約
- ファイル: kebab-case
- コンポーネント: PascalCase
- 関数・変数: camelCase
- 定数: UPPER_SNAKE_CASE

---

## 🤝 コントリビューション

### プルリクエスト
1. 機能ブランチを作成
2. テスト追加・実行
3. リント実行
4. プルリクエスト作成

### コミットメッセージ
```
feat: 新機能追加
fix: バグ修正
docs: ドキュメント更新
style: スタイル修正
refactor: リファクタリング
test: テスト追加
chore: その他の変更
```

---

**最終更新：** 2025年6月15日