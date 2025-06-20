# 会話サンプル機能 - ユーザーストーリー

## 🎯 目的
プロンプトの実際の使い心地を事前に体験できるようにし、利用率を向上させる

## 📊 成功指標
- プロンプトカード → 詳細ページ遷移率: 20% → 35%
- 詳細ページ → コピー率: 15% → 30%

## 📝 ユーザーストーリー

### Phase 1: MVP（必須機能）

#### データモデル
- [ ] **開発者として**、promptsテーブルにexamplesフィールドを追加したい、会話例を保存できるようにするため

#### プロンプト作成者向け
- [ ] **プロンプト作成者として**、会話例を追加したい、使い方を具体的に示すため
- [ ] **プロンプト作成者として**、会話例を編集・削除したい、内容を改善するため
- [ ] **プロンプト作成者として**、最大5個まで会話例を登録したい、適切な量を保つため

#### プロンプト利用者向け
- [ ] **プロンプト利用者として**、カードで会話例を2個まで見たい、素早く雰囲気を掴むため
- [ ] **プロンプト利用者として**、詳細ページで全ての会話例を見たい、じっくり検討するため
- [ ] **プロンプト利用者として**、会話例がチャット風UIで表示されるのを見たい、実際の会話をイメージしやすくするため

### Phase 2: 機能拡張

#### 作成体験の向上
- [ ] **プロンプト作成者として**、会話例に場面説明を追加したい、コンテキストを明確にするため
- [ ] **プロンプト作成者として**、会話例の順番を入れ替えたい、重要な例を上に表示するため
- [ ] **プロンプト作成者として**、会話例のプレビューを見たい、公開前に確認するため

#### 利用体験の向上
- [ ] **プロンプト利用者として**、場面タグで会話例を絞り込みたい、特定の用途を探すため
- [ ] **プロンプト利用者として**、特におすすめの会話例を見たい、最も代表的な例を知るため

### Phase 3: 将来的な拡張

- [ ] **プロンプト利用者として**、他のユーザーが投稿した会話例を見たい、より多くの使用例を知るため
- [ ] **プロンプト作成者として**、AIが会話例を提案してくれるのを見たい、作成の手間を減らすため

## 🔧 技術的な受け入れ条件

### データベース
- examples配列フィールドの追加（最大5要素）
- 各例: id, userMessage(200字), characterResponse(500字), scenario(50字)
- exampleCountフィールドで数を管理

### UI/UX
- カード: 最初の2例を表示、文字数制限で省略
- 詳細: 全例をチャット風UIで表示
- フォーム: 追加・編集・削除・並び替え可能

### バリデーション
- 文字数制限の適用
- XSS対策（サニタイゼーション）
- 最大数制限（5個）

## 📅 見積もり

### Phase 1: 2週間
- Week 1: バックエンド実装（DB、API）
- Week 2: フロントエンド実装（UI）

### Phase 2: 1週間
- 機能拡張とUX改善

## 💭 メモ・懸念事項
- 不適切なコンテンツへの対策（報告機能は別途検討）
- モバイルでの表示最適化
- 既存プロンプトへの影響（nullableで対応）