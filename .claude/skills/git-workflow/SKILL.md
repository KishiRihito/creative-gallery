---
name: git-workflow-testing
description: マッチングアプリ（Next.js 16 + Supabase + Prisma）プロジェクトにおけるGitワークフロー、テスト作成、テスト・Lint実行の標準手順を定義するスキル。ブランチ運用、コミット規約、PR運用、機能実装時に伴うテスト作成義務、フェーズ終了時の一括チェック手順を扱う。コード実装・機能追加・バグ修正・ブランチ作成・コミット・PR作成・テスト実行・Lint実行のいずれかを行う際は必ずこのスキルを参照すること。
---

# Git Workflow & Testing Skill

このスキルは、Claude Code がこのリポジトリでコード実装を行う際に**必ず**従うべき Git 運用手順とテスト運用手順を定義する。関連仕様は以下も参照する。
- `02_testing-lint-spec.md`（使用ツール・カバレッジ方針の詳細）
- `03_api-design-spec.md` / `04_db-design-spec.md`（実装対象の仕様）

---

## 1. ブランチ運用

### 1.1 ブランチ構成
- `master`: 常にデプロイ可能な状態を維持する。直接コミット禁止。
- 機能ブランチ: `master` から作成し、実装完了後 `master` へPRでマージする。

### 1.2 ブランチ命名規則

```
{phase}/{feature-slug}
```

| phase | 対応フェーズ |
|---|---|
| `phase1` | Home/Profile/Like/Match/Chatのコア導線 |
| `phase2` | スワイプ・複数画像・オンライン表示・未読件数・会話のきっかけ・通報/ブロック |
| `phase3` | 通知・詳細検索・本人確認・課金 |

例:
- `phase1/auth`
- `phase1/like-match`
- `phase2/swipe-ui`
- `phase3/payment-mock`

バグ修正・雑務ブランチは `fix/{slug}` / `chore/{slug}` とする。

### 1.3 1ブランチ1機能の原則
- 1つの機能ブランチには、対応する1機能分の実装・テスト・型定義のみを含める。
- `03_api-design-spec.md` の機能単位（例: Like/Pass、Chat、複数プロフィール画像）をそのままブランチ単位の粒度とする。

---

## 2. コミット規約

[Conventional Commits](https://www.conventionalcommits.org/) 形式を採用する。

```
{type}({scope}): {summary}
```

| type | 用途 |
|---|---|
| `feat` | 新機能実装 |
| `fix` | バグ修正 |
| `test` | テストの追加・修正のみ |
| `refactor` | 挙動を変えないコード改善 |
| `chore` | 設定変更・依存関係更新等 |
| `docs` | ドキュメントのみの変更 |
| `perf` | パフォーマンス改善 |
| `a11y` | アクセシビリティ改善 |

### 3.1 コミットメッセージのbody（「なぜ」の記載）

1行目（`{type}({scope}): {summary}`）には「何をしたか」を書き、**空行を挟んだbodyには必ず「なぜその変更が必要だったか」を記載する。** 背景・課題・意思決定の理由が分かるようにし、単なる作業内容の言い換えにしない。

例:
```
feat(like): Like送信とMatch判定ロジックを実装

Home一覧からのLike操作を起点にMatch成立まで繋げる必要があり、
双方向Likeの検知をDBトランザクション内で行うことで、
同時送信時にMatchが重複作成される競合状態を防ぐため。

perf(home): おすすめユーザー一覧のクエリにインデックスを追加

ユーザー数増加に伴いHome表示が遅延していたため、
Like/Passテーブルへのフィルタ条件にインデックスを張り、
一覧取得のレスポンスタイムを改善する必要があった。

a11y(chat): メッセージ入力欄にaria-labelを追加

スクリーンリーダー利用時に入力欄の用途が読み上げられず、
Chat機能を利用できないユーザーが発生する問題があったため。
```

**原則: 実装コードとその単体テストは同一コミット、または同一PR内の隣接コミットに含める。** テストを後回しにして別PRに切り出すことはしない。

---

## 3. 機能実装時の標準手順

新規機能を実装する際は、必ず以下の順序で進める。

1. `master` から機能ブランチを作成する（命名規則は上記1.2に従う）。
2. `03_api-design-spec.md` / `04_db-design-spec.md` を確認し、実装対象のインターフェース・スキーマを把握する。
3. 実装する（Server Action / コンポーネント / Prismaスキーマ変更 等）。
4. **同じ作業の中で** 対応する単体テスト（Vitest）を作成する。最低限、正常系1件・主要な異常系1件をカバーする（`02_testing-lint-spec.md` 5節参照）。
5. コア導線に関わる変更（Phase1の主要機能、または既存E2Eシナリオに影響する変更）の場合は、Playwrightシナリオの追加・更新要否を判断する。
6. ローカルで以下を実行し、全て成功することを確認する。
   ```bash
   pnpm biome check .
   pnpm typecheck
   pnpm test
   ```
7. Conventional Commits 形式でコミットする。
8. リモートへpushし、`master` へのPRを作成する。PR説明には「対応する機能」「実装した内容」「追加したテスト」を簡潔に記載する。
9. CI（GitHub Actions）の `lint` / `unit-test` / `build` ジョブが成功することを確認してからマージする（マージ方式: Squash and merge、コミット履歴を1機能1コミットに集約する）。

---

## 4. フェーズ終了時の追加手順

各フェーズ（Phase1/2/3）の全機能ブランチのマージが完了した時点で、`master` 上で以下を追加実行する。

1. `pnpm biome check .`
2. `pnpm typecheck`
3. `pnpm test`（単体・統合テスト全件）
4. `pnpm test:e2e`（そのフェーズまでに実装済みの全E2Eシナリオ）
5. 全て成功したら、`git tag phase{N}-complete` でタグを付与し、次フェーズの実装に着手する。

いずれかのチェックが失敗した場合、**次フェーズの機能ブランチは作成せず**、`master` 上での修正を優先する。

---

## 5. テスト作成の判断基準

| 変更内容 | 必須テスト |
|---|---|
| Server Action新規追加 | Vitest単体テスト（正常系・異常系） |
| Prismaスキーマ変更（テーブル追加・カラム追加） | 統合テスト（実際のDB操作を伴うテスト、または既存統合テストの更新） |
| RLSポリシー追加・変更 | 統合テストで「他ユーザーのデータにアクセスできないこと」を検証するケースを追加 |
| コア導線（Home→Profile→Like→Match→Chat）に関わるUI変更 | 該当するPlaywright E2Eシナリオを更新、無ければ新規追加 |
| 表示のみのUI微修正（文言・レイアウト） | 単体テスト・E2E追加は任意。既存テストを壊していないことのみ確認 |

---

## 6. Git Hookとの関係

このリポジトリには Husky による以下のHookが設定されている（詳細は `02_testing-lint-spec.md` 5節）。

- `pre-commit`: `lint-staged` によりステージ済みファイルへ Biome の Lint/Format を自動適用
- `pre-push`: `pnpm typecheck && pnpm test` を実行し、失敗時はpushを中断

Claude Codeがコミット・push操作を行う際、Hookによる自動チェックが失敗した場合は、**Hookをスキップ（`--no-verify`）せず**、原因を修正してから再度コミット・pushを行うこと。
