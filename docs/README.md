# Character Bank ドキュメント

このディレクトリには、Character Bankプロジェクトの開発・管理に関するドキュメントが含まれています。

## 📂 ディレクトリ構造

```
docs/
├── README.md                        # このファイル（ドキュメントのインデックス）
├── active/                          # 現在使用中のドキュメント（日常参照）
│   ├── UNIFIED_ROADMAP.md           # プロジェクト全体のロードマップ（マスター）
│   ├── SPRINT_PLAN.md               # 現在のスプリント計画と進捗管理
│   ├── WEEKLY_TASKS.md              # 週次タスクの詳細管理
│   ├── TECHNICAL_DEBT.md            # 技術的負債とリファクタリング計画
│   └── IMPLEMENTATION_GUIDE.md      # 実装パターンとコマンド集
├── planning/                        # 計画・設計ドキュメント
│   ├── user-stories/                # ユーザーストーリー関連
│   │   └── USER_STORIES_CONVERSATION_EXAMPLES.md
│   └── prd/                         # プロダクト要求仕様書
│       └── PRD_CONVERSATION_EXAMPLES.md
└── archive/                         # 使わなくなったドキュメント（将来使用）
```

## 🎯 ディレクトリの用途

### 📋 active/ - アクティブドキュメント
**日常的な開発で頻繁に参照するドキュメント**
- 毎日の作業管理
- 進捗確認
- 実装時の参考資料
- 技術的課題の管理

### 📐 planning/ - 計画・設計ドキュメント
**新機能や改善を計画する際に参照するドキュメント**
- ユーザーストーリー
- プロダクト要求仕様書（PRD）
- 機能設計書
- アーキテクチャ設計

### 📦 archive/ - アーカイブ
**使わなくなったが保管しておくドキュメント**
- 完了したスプリント計画
- 古いロードマップ
- 参考資料として残すドキュメント

## 🚀 Claude向け参照ガイド

### 開発作業時
```
active/IMPLEMENTATION_GUIDE.md  ← 実装パターン・コマンド
active/WEEKLY_TASKS.md         ← 今日のタスク確認
active/TECHNICAL_DEBT.md       ← リファクタリング項目
```

### 新機能開発時
```
planning/user-stories/         ← ユーザーストーリー
planning/prd/                 ← 機能仕様書
active/UNIFIED_ROADMAP.md     ← 全体戦略との整合性確認
```

### 進捗管理時
```
active/SPRINT_PLAN.md         ← スプリント目標・進捗
active/WEEKLY_TASKS.md        ← 週次計画・日次作業
active/UNIFIED_ROADMAP.md     ← 長期計画との整合性
```

## 🗂️ ドキュメント体系（更新版）

```
全体戦略
┌─────────────────────────────────────┐
│   active/UNIFIED_ROADMAP.md         │ ← マスタープラン
└──────────┬──────────────────────────┘
           │
    ┌──────┴──────┐
    │             │
┌───▼───┐    ┌───▼────┐
│SPRINT  │    │WEEKLY  │  ← 実行管理
│PLAN.md │    │TASKS.md│
└────────┘    └─────────┘
    │                │
┌───▼──────────┐  ┌─▼──────────────┐
│TECHNICAL_DEBT│  │IMPLEMENTATION  │ ← 実行支援
│.md           │  │GUIDE.md        │
└──────────────┘  └────────────────┘

新機能計画
┌─────────────────────────────────────┐
│   planning/prd/                     │ ← 機能仕様
└──────────┬──────────────────────────┘
           │
┌──────────▼──────────────────────────┐
│   planning/user-stories/            │ ← ユーザー視点
└─────────────────────────────────────┘
```

## 📅 更新サイクル

| ドキュメント | 更新頻度 | 責任者 | 目的 |
|------------|---------|--------|------|
| active/UNIFIED_ROADMAP | 月次 | PM/リード | 全体戦略の調整 |
| active/SPRINT_PLAN | 2週間 | 開発チーム | スプリント管理 |
| active/WEEKLY_TASKS | 毎日 | 各開発者 | 日次進捗管理 |
| active/TECHNICAL_DEBT | 月次 | テックリード | 品質改善計画 |
| planning/ | 機能追加時 | 企画者 | 新機能の設計 |

## 🔄 ワークフロー

### 1. 計画フェーズ
1. `active/UNIFIED_ROADMAP.md`で四半期目標確認
2. `active/SPRINT_PLAN.md`で2週間の計画作成
3. `active/WEEKLY_TASKS.md`で週次タスク分解

### 2. 実行フェーズ
1. `active/WEEKLY_TASKS.md`の日次タスク実行
2. 進捗を毎日更新
3. ブロッカーを記録

### 3. レビューフェーズ
1. 週次: `active/WEEKLY_TASKS.md`の振り返り
2. スプリント終了: `active/SPRINT_PLAN.md`更新
3. 月次: `active/UNIFIED_ROADMAP.md`見直し

### 4. 新機能開発時
1. `planning/prd/`で機能仕様を定義
2. `planning/user-stories/`でユーザー視点を整理
3. `active/UNIFIED_ROADMAP.md`で全体計画に組み込み

## 🏷️ タスク優先度

- **P0 (緊急)**: 即座に対応が必要、ブロッカー
- **P1 (高)**: 現在のスプリントで完了必須
- **P2 (中)**: 次のスプリントまでに完了
- **P3 (低)**: バックログ、時間がある時に

## 📝 ドキュメント管理ガイドライン

### 新しいドキュメントの追加

#### 日常業務関連 → active/
- スプリント計画書
- タスク管理表
- 技術調査レポート
- 実装ガイド

#### 機能企画関連 → planning/
- ユーザーストーリー → planning/user-stories/
- PRD（プロダクト要求仕様書） → planning/prd/
- アーキテクチャ設計書 → planning/architecture/
- UI/UXデザイン仕様 → planning/design/

#### 完了・非アクティブ → archive/
- 完了したスプリント計画
- 古いロードマップ
- 使わなくなった仕様書

### ファイル命名規則
- **日付を含む場合**: YYYY-MM-DD_DOCUMENT_NAME.md
- **機能名を含む場合**: FEATURE_NAME_DOCUMENT_TYPE.md
- **バージョン管理**: DOCUMENT_NAME_v1.0.md

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

## 📖 プロジェクトルートのドキュメント
- **[../README.md](../README.md)** - プロジェクト概要（Convexテンプレート）
- **[../ROADMAP.md](../ROADMAP.md)** - 機能別ロードマップ（レガシー）
- **[../TODO.md](../TODO.md)** - 緊急タスクリスト（レガシー）
- **[../DEVELOPMENT.md](../DEVELOPMENT.md)** - 開発環境セットアップガイド

## 🔗 関連リンク

- [Convex Documentation](https://docs.convex.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Documentation](https://clerk.com/docs)

---

**最終更新**: 2025-06-16
**メンテナー**: 開発チーム