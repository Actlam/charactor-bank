# Character Bank Test Suite

このドキュメントは、Character Bankプロジェクトのテストスイートについて説明します。

## 📊 テストカバレッジ状況

### ✅ 完了したコンポーネント

#### 1. **prompt-card.tsx** (14 tests)
- ✅ プロンプト表示機能（タイトル、説明、カテゴリ、タグ）
- ✅ コピー機能とクリップボード操作
- ✅ レスポンシブ表示とタグ制限
- ✅ リンク機能と統計情報表示
- ✅ エラーハンドリングとエッジケース

#### 2. **tag-input.tsx** (21 tests)
- ✅ タグ入力・追加・削除機能
- ✅ バリデーション（重複チェック、文字制限）
- ✅ 最大タグ数制限
- ✅ キーボード操作（Enter キー）
- ✅ UIとスタイリング

#### 3. **user-button.tsx** (20 tests)
- ✅ ドロップダウンメニュー表示
- ✅ ユーザー情報表示（アバター、名前、メール）
- ✅ プロフィールページナビゲーション
- ✅ ログアウト機能
- ✅ 認証状態の処理

#### 4. **bookmark-button.tsx** (20 tests)
- ✅ ブックマーク機能（追加・削除）
- ✅ 楽観的更新機能
- ✅ 認証チェック
- ✅ ローディング状態
- ✅ エラーハンドリング

### 🚧 部分的に完了したコンポーネント

#### 5. **like-button.tsx** (テスト作成済み、依存関係の問題)
- ⚠️ Sonnerライブラリ未インストールによりテスト実行できず
- ✅ テストケース作成済み：
  - いいね機能（追加・削除）
  - 楽観的更新
  - トースト通知
  - 認証チェック
  - エラーハンドリング

#### 6. **conversation-examples-display.tsx** (一部テスト失敗)
- ✅ 基本表示機能
- ✅ 会話例の表示制限機能
- ⚠️ CSS クラスの検証で一部失敗
- ⚠️ ハイライト表示のテストで問題

## 🧪 テスト実行方法

### 動作するテストを実行
```bash
# 完全に動作するテスト
npm test -- __tests__/components/prompt-card.test.tsx
npm test -- __tests__/components/tag-input.test.tsx  
npm test -- __tests__/components/user-button.test.tsx
npm test -- __tests__/components/bookmark-button.test.tsx

# すべてのコンポーネントテスト（一部失敗含む）
npm test -- __tests__/components/
```

### カバレッジレポート
```bash
npm run test:coverage -- __tests__/components/
```

## 🔧 モック設定

### グローバルモック（vitest.setup.ts）
- **Clerk認証**: ユーザー認証状態のモック
- **Convex**: データベース操作のモック
- **Next.js Navigation**: ルーティングのモック
- **Clipboard API**: クリップボード操作のモック
- **Sonner**: トースト通知のモック

### 個別コンポーネントモック
各テストファイルで必要に応じて追加のモックを設定しています。

## 📝 テストパターン

### 共通テストパターン
1. **レンダリングテスト**: コンポーネントが正常に表示される
2. **プロパティテスト**: 各プロパティが正しく反映される
3. **インタラクションテスト**: ユーザー操作に正しく反応する
4. **認証テスト**: 認証状態による動作の違い
5. **エラーハンドリング**: エラー状況での適切な処理
6. **エッジケース**: 境界値や特殊な状況での動作

### コンポーネント固有テスト
- **prompt-card**: クリップボード操作、タグ表示制限
- **tag-input**: 重複検証、最大数制限、キーボード操作
- **user-button**: ドロップダウン、ナビゲーション
- **bookmark-button/like-button**: 楽観的更新、API操作

## 🚨 現在の問題と解決方法

### 1. Sonner依存関係
**問題**: `like-button.tsx`でsonnerライブラリを使用しているが未インストール
**解決方法**: 
```bash
npm install sonner
```

### 2. CSS クラステスト
**問題**: Tailwind CSS クラスの動的生成によるテスト失敗
**解決方法**: より具体的なセレクタ使用、またはdata-testid属性の追加

### 3. テストデータ
**問題**: 一部のコンポーネントで現実的なテストデータが不足
**解決方法**: より包括的なモックデータの作成

## 📈 今後の改善計画

### Phase 1: 現在の問題修正
- [ ] Sonnerライブラリのインストール
- [ ] CSSクラステストの修正
- [ ] 失敗しているテストケースの修正

### Phase 2: カバレッジ拡大
- [ ] 残りのコンポーネントのテスト作成
- [ ] 統合テストの追加
- [ ] E2Eテストの検討

### Phase 3: テスト品質向上
- [ ] テストデータのファクトリー化
- [ ] より現実的なシナリオテスト
- [ ] パフォーマンステスト

## 🏆 成功指標

現在の達成状況：
- **テストファイル**: 6個作成
- **テストケース**: 105個（成功）+ 3個（失敗）= 108個
- **カバレッジ対象**: 主要コンポーネント6個
- **実行成功率**: 97.2% (105/108)

目標：
- [ ] テスト成功率 100%
- [ ] コンポーネントカバレッジ 80%以上
- [ ] テスト実行時間 2秒以内

## 📚 参考資料

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)
- [User Event](https://testing-library.com/docs/user-event/intro/)