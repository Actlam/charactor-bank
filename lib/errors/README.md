# エラーハンドリングシステム

Character Bank プロジェクトのグローバルエラーハンドリングシステムの完全なドキュメントです。

## 概要

このシステムは以下の機能を提供します：

- **カスタムエラータイプ**: 用途別の詳細なエラー分類
- **グローバルエラーバウンダリ**: React/Next.jsでの未処理エラーキャッチ
- **統合ログ＆モニタリング**: Sentryとの連携
- **ユーザーフレンドリーなエラー表示**: 適切なエラーメッセージとUI
- **API/Convexエラーハンドリング**: バックエンドエラーの統一処理

## ファイル構成

```
lib/errors/
├── types.ts              # エラータイプ定義
├── handler.ts             # 中央エラーハンドラー
├── api-handler.ts         # API/Convex用エラーハンドラー
├── index.ts              # エクスポート
└── README.md             # このファイル

hooks/
└── use-error-handler.ts   # React用エラーハンドリングフック

convex/lib/
└── errors.ts             # Convex関数用エラーユーティリティ

app/
├── global-error.tsx       # グローバルエラーバウンダリ
├── error.tsx             # ページレベルエラーバウンダリ
└── prompts/[id]/
    └── not-found.tsx     # 404エラーページ
```

## 使用方法

### 1. フロントエンドコンポーネントでの使用

```tsx
import { useErrorHandler } from '@/hooks/use-error-handler';
import { ValidationError, NetworkError } from '@/lib/errors';

function MyComponent() {
  const { handleError } = useErrorHandler({
    showToast: true,
    redirectOnAuth: true,
    context: { componentName: 'MyComponent' },
  });

  const handleSubmit = async () => {
    try {
      // 何らかの処理
      const result = await someApiCall();
    } catch (error) {
      // エラーを適切に処理
      handleError(error as Error);
    }
  };

  return (
    // コンポーネントのJSX
  );
}
```

### 2. useTryCatch フックの使用

```tsx
import { useTryCatch } from '@/hooks/use-error-handler';

function MyComponent() {
  const { tryAsync } = useTryCatch();

  const handleOperation = async () => {
    const result = await tryAsync(
      async () => {
        return await someApiCall();
      },
      {
        onSuccess: (data) => console.log('成功:', data),
        onError: (error) => console.log('エラー:', error),
        showToast: true,
      }
    );

    if (result) {
      // 成功時の処理
    }
  };
}
```

### 3. Convex関数での使用

```ts
import { mutation } from './_generated/server';
import {
  requireAuth,
  validateString,
  throwValidationError,
  throwNotFoundError,
} from './lib/errors';

export const createItem = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    // 認証チェック
    const userId = await requireAuth(ctx);

    // バリデーション
    const name = validateString(args.name, 'name', {
      required: true,
      minLength: 3,
      maxLength: 100,
    });

    // ビジネスロジック
    const item = await ctx.db.insert('items', {
      name: name!,
      userId,
    });

    return item;
  },
});
```

### 4. Convex Mutation の拡張使用

```tsx
import { createMutationHandler } from '@/lib/errors/api-handler';
import { useMutation } from 'convex/react';

function MyComponent() {
  const baseMutation = useMutation(api.myTable.create);
  
  const createItem = createMutationHandler(baseMutation, {
    onSuccess: (result) => {
      toast.success('作成しました');
      router.push(`/items/${result}`);
    },
    onError: (error) => {
      console.error('作成に失敗:', error);
    },
    context: { action: 'create-item' },
  });

  return (
    <Button onClick={() => createItem({ name: 'test' })}>
      作成
    </Button>
  );
}
```

## エラータイプ

### BaseError
すべてのカスタムエラーの基底クラス

```ts
new BaseError(
  message: string,
  category: ErrorCategory,
  severity: ErrorSeverity,
  context?: ErrorContext,
  originalError?: Error
)
```

### ValidationError
入力値検証エラー

```ts
new ValidationError(
  message: string,
  field?: string,      // エラーのあるフィールド名
  value?: any,         // エラーのある値
  context?: ErrorContext
)
```

### AuthenticationError
認証エラー

```ts
new AuthenticationError(
  message: string,
  context?: ErrorContext
)
```

### AuthorizationError
認可エラー

```ts
new AuthorizationError(
  message: string,
  resource?: string,   // リソース名
  action?: string,     // アクション名
  context?: ErrorContext
)
```

### NetworkError
ネットワークエラー

```ts
new NetworkError(
  message: string,
  statusCode?: number,
  url?: string,
  context?: ErrorContext,
  originalError?: Error
)
```

### DatabaseError
データベースエラー

```ts
new DatabaseError(
  message: string,
  operation?: string,  // 操作名
  table?: string,      // テーブル名
  context?: ErrorContext,
  originalError?: Error
)
```

### BusinessLogicError
ビジネスロジックエラー

```ts
new BusinessLogicError(
  message: string,
  code?: string,       // エラーコード
  severity?: ErrorSeverity,
  context?: ErrorContext
)
```

## エラーカテゴリ

- `VALIDATION`: 入力値検証エラー
- `AUTHENTICATION`: 認証エラー
- `AUTHORIZATION`: 認可エラー
- `NETWORK`: ネットワークエラー
- `DATABASE`: データベースエラー
- `EXTERNAL_SERVICE`: 外部サービスエラー
- `BUSINESS_LOGIC`: ビジネスロジックエラー
- `UNKNOWN`: 不明なエラー

## エラー重要度

- `LOW`: 低重要度（ログのみ）
- `MEDIUM`: 中重要度（警告レベル）
- `HIGH`: 高重要度（エラーレベル）
- `CRITICAL`: 重大（緊急対応が必要）

## ベストプラクティス

### 1. 適切なエラータイプの選択

```ts
// ❌ 悪い例
throw new Error('ユーザーが見つかりません');

// ✅ 良い例
throw new BusinessLogicError('ユーザーが見つかりません', 'USER_NOT_FOUND');
```

### 2. エラーコンテキストの活用

```ts
handleError(error, {
  userId: user.id,
  action: 'create-prompt',
  promptId: newPromptId,
  timestamp: new Date(),
});
```

### 3. ユーザーフレンドリーなメッセージ

```ts
// ❌ 技術的すぎる
'Failed to establish database connection'

// ✅ ユーザーフレンドリー
'データの保存中にエラーが発生しました。しばらくしてからもう一度お試しください。'
```

### 4. エラー境界の設定

```tsx
// ページレベルでエラーバウンダリを設定
// app/my-page/error.tsx を作成

'use client';

export default function Error({ error, reset }: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>エラーが発生しました</h2>
      <button onClick={reset}>再試行</button>
    </div>
  );
}
```

## 開発とデバッグ

### 開発環境での設定

```ts
// 開発環境では詳細なエラー情報を表示
if (process.env.NODE_ENV === 'development') {
  console.group(`🚨 ${error.name}: ${error.message}`);
  console.log('Stack Trace:', error.stack);
  console.groupEnd();
}
```

### Sentryとの連携

本番環境では自動的にSentryにエラーが送信されます：

- `ErrorSeverity.LOW`: 送信しない
- `ErrorSeverity.MEDIUM`: warning レベル
- `ErrorSeverity.HIGH`: error レベル
- `ErrorSeverity.CRITICAL`: fatal レベル

## トラブルシューティング

### よくある問題

1. **エラーが重複して表示される**
   - `showToast: false` オプションを使用
   - エラーハンドリングの重複を確認

2. **Sentryにエラーが送信されない**
   - 環境変数 `SENTRY_DSN` の設定を確認
   - `NODE_ENV=production` の設定を確認

3. **バリデーションエラーが適切に表示されない**
   - フォームコンポーネントでの `validationErrors` 状態管理を確認
   - エラーメッセージのバインディングを確認

### デバッグ用コマンド

```bash
# エラーログの確認
npm run dev  # 開発サーバーでコンソールログを確認

# Sentryの確認
# https://sentry.io/ でプロジェクトダッシュボードを確認
```

## 今後の拡張

- エラー統計の収集と分析
- エラー発生時の自動リトライ機能
- ユーザー向けエラーレポート機能
- A/Bテスト用のエラー表示パターン

このエラーハンドリングシステムにより、Character Bank アプリケーションは堅牢で保守しやすいエラー処理を実現しています。