# Character Bank デプロイメントガイド

このドキュメントは、Character Bankを本番環境にデプロイするための詳細な手順を説明します。

## 📋 前提条件

- Node.js 18.17以上
- npmまたはyarn
- Gitがインストールされていること
- 以下のアカウントが必要です：
  - [Convex](https://www.convex.dev/)アカウント
  - [Clerk](https://clerk.com/)アカウント
  - [Vercel](https://vercel.com/)アカウント（推奨）
  - [Sentry](https://sentry.io/)アカウント（オプション）

## 🚀 デプロイ手順

### 1. Convexの本番環境セットアップ

```bash
# Convexにログイン
npx convex login

# 本番用プロジェクトを作成
npx convex init --prod

# 本番環境にデプロイ
npx convex deploy --prod
```

デプロイ後、Convexダッシュボードから以下の情報を取得：
- Production Deployment URL
- Deployment Name

### 2. Clerkの本番環境セットアップ

1. [Clerk Dashboard](https://dashboard.clerk.com/)にログイン
2. 新しいアプリケーションを作成（Production用）
3. 以下の設定を行う：
   - Sign-in methods: Email/Password, Google OAuth
   - Allowed redirect URLs: `https://your-domain.com/*`
4. APIキーを取得：
   - Publishable Key
   - Secret Key
   - JWT Issuer Domain

### 3. 環境変数の設定

`.env.production`ファイルを以下の内容で更新：

```env
# Convex Production
CONVEX_DEPLOYMENT=prod:your-production-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-production-url.convex.cloud

# Clerk Production
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your-key
CLERK_SECRET_KEY=sk_live_your-secret
CLERK_JWT_ISSUER_DOMAIN=https://your-domain.clerk.accounts.dev

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Sentry (optional)
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_AUTH_TOKEN=your-auth-token
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
```

### 4. Vercelへのデプロイ

#### 自動デプロイ（推奨）

1. GitHubリポジトリをVercelに接続
2. 環境変数をVercelダッシュボードで設定
3. デプロイ設定：
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": ".next",
     "installCommand": "npm install",
     "framework": "nextjs"
   }
   ```

#### 手動デプロイ

```bash
# Vercel CLIをインストール
npm i -g vercel

# ログイン
vercel login

# デプロイ
vercel --prod
```

### 5. データベースの初期化

本番環境のConvexデータベースに初期データを投入：

```bash
# カテゴリデータの投入
npx convex run categories:seedCategories --prod

# 必要に応じてサンプルプロンプトも投入
# npx convex run prompts:seedPrompts --prod
```

### 6. セキュリティ設定

#### CORS設定
Convexダッシュボードで、本番ドメインからのアクセスを許可：
- Allowed Origins: `https://your-domain.com`

#### レート制限
Vercelの設定でレート制限を有効化：
```json
{
  "functions": {
    "api/*": {
      "maxDuration": 10
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### 7. モニタリング設定（オプション）

#### Sentry設定
1. Sentryプロジェクトを作成
2. DSNとAuth Tokenを取得
3. 環境変数に設定
4. ソースマップのアップロード：
   ```bash
   npm run build
   npx sentry-cli releases new <version>
   npx sentry-cli releases files <version> upload-sourcemaps .next
   npx sentry-cli releases finalize <version>
   ```

#### Vercel Analytics
Vercelダッシュボードから有効化

## 🔍 デプロイ後の確認

### 1. 基本動作確認
- [ ] トップページが正常に表示される
- [ ] 認証（サインイン/サインアップ）が動作する
- [ ] プロンプトの作成・表示・編集・削除が動作する
- [ ] いいね・ブックマーク機能が動作する
- [ ] カテゴリ別表示が動作する
- [ ] 検索機能が動作する

### 2. パフォーマンス確認
- [ ] Lighthouse scoreが80以上
- [ ] First Contentful Paint < 2秒
- [ ] Time to Interactive < 3秒

### 3. セキュリティ確認
- [ ] HTTPSが有効
- [ ] セキュリティヘッダーが設定されている
- [ ] 環境変数が本番用に設定されている
- [ ] エラーページが適切に表示される

## 🚨 トラブルシューティング

### Convex接続エラー
```
Error: Failed to connect to Convex
```
→ CONVEX_DEPLOYMENT と NEXT_PUBLIC_CONVEX_URL を確認

### Clerk認証エラー
```
Error: Invalid Clerk configuration
```
→ Clerk APIキーとJWT Issuer Domainを確認

### ビルドエラー
```
Error: Build failed
```
→ 環境変数が全て設定されているか確認
→ `npm run build`をローカルで実行して確認

### 404エラー
→ Vercelのルーティング設定を確認
→ `vercel.json`に以下を追加：
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ]
}
```

## 📝 メンテナンス

### アップデート手順
1. ローカルで変更をテスト
2. ステージング環境でテスト（あれば）
3. 本番環境にデプロイ
4. デプロイ後の動作確認

### バックアップ
- Convexデータは自動的にバックアップされます
- 定期的にデータエクスポートを実行することを推奨

### ロールバック
Vercelダッシュボードから以前のデプロイメントに即座にロールバック可能

## 🔗 関連リンク

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Convex Production Guide](https://docs.convex.dev/production)
- [Vercel Documentation](https://vercel.com/docs)
- [Clerk Production Checklist](https://clerk.com/docs/deployments/overview)