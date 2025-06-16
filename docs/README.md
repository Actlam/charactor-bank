# Character Bank ドキュメント

このディレクトリには、Character Bankプロジェクトの開発・管理に関するドキュメントが含まれています。

## 📚 ドキュメント一覧

### 開発管理
- **[UNIFIED_ROADMAP.md](./UNIFIED_ROADMAP.md)** - プロジェクト全体のロードマップ（マスター文書）
- **[SPRINT_PLAN.md](./SPRINT_PLAN.md)** - 現在のスプリント計画と進捗管理
- **[WEEKLY_TASKS.md](./WEEKLY_TASKS.md)** - 週次タスクの詳細管理
- **[TECHNICAL_DEBT.md](./TECHNICAL_DEBT.md)** - 技術的負債とリファクタリング計画
- **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** - 実装パターンとコマンド集

### プロジェクトルート
- **[../README.md](../README.md)** - プロジェクト概要（Convexテンプレート）
- **[../ROADMAP.md](../ROADMAP.md)** - 機能別ロードマップ（レガシー）
- **[../TODO.md](../TODO.md)** - 緊急タスクリスト（レガシー）
- **[../DEVELOPMENT.md](../DEVELOPMENT.md)** - 開発環境セットアップガイド

## 🗂️ ドキュメント体系

```
優先度と用途:
┌─────────────────────────────────────┐
│   UNIFIED_ROADMAP.md (マスター)      │ ← 全体戦略
└──────────┬──────────────────────────┘
           │
    ┌──────┴──────┐
    │             │
┌───▼───┐    ┌───▼────┐
│SPRINT  │    │WEEKLY  │  ← 実行計画
│PLAN.md │    │TASKS.md│
└────────┘    └─────────┘
    │                │
┌───▼──────────┐  ┌─▼──────────────┐
│TECHNICAL_DEBT│  │IMPLEMENTATION  │ ← 参照資料
│.md           │  │GUIDE.md        │
└──────────────┘  └────────────────┘
```

## 📅 更新サイクル

| ドキュメント | 更新頻度 | 責任者 | 目的 |
|------------|---------|--------|------|
| UNIFIED_ROADMAP | 月次 | PM/リード | 全体戦略の調整 |
| SPRINT_PLAN | 2週間 | 開発チーム | スプリント管理 |
| WEEKLY_TASKS | 毎日 | 各開発者 | 日次進捗管理 |
| TECHNICAL_DEBT | 月次 | テックリード | 品質改善計画 |

## 🔄 ワークフロー

### 1. 計画フェーズ
1. `UNIFIED_ROADMAP.md`で四半期目標確認
2. `SPRINT_PLAN.md`で2週間の計画作成
3. `WEEKLY_TASKS.md`で週次タスク分解

### 2. 実行フェーズ
1. `WEEKLY_TASKS.md`の日次タスク実行
2. 進捗を毎日更新
3. ブロッカーを記録

### 3. レビューフェーズ
1. 週次: `WEEKLY_TASKS.md`の振り返り
2. スプリント終了: `SPRINT_PLAN.md`更新
3. 月次: `UNIFIED_ROADMAP.md`見直し

## 🏷️ タスク優先度

- **P0 (緊急)**: 即座に対応が必要、ブロッカー
- **P1 (高)**: 現在のスプリントで完了必須
- **P2 (中)**: 次のスプリントまでに完了
- **P3 (低)**: バックログ、時間がある時に

## 📝 ドキュメント作成ガイドライン

### フォーマット
- Markdown形式を使用
- 見出しは階層的に構造化
- タスクはチェックボックス`[ ]`で管理
- 日付は`YYYY-MM-DD`形式

### 内容の原則
- 具体的で実行可能なタスクに分解
- 期限と担当者を明確に
- 定期的な更新と振り返り
- 完了基準を明確に定義

## 🔗 関連リンク

- [Convex Documentation](https://docs.convex.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Documentation](https://clerk.com/docs)

---

**最終更新**: 2025-06-16
**メンテナー**: 開発チーム