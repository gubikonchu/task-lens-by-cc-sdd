# Brief: todo-app

## Problem
個人のタスク管理において、シンプルかつ使いやすいWebアプリがない。期限日・優先度の管理が煩雑で、タスクの見落としが発生する。

## Current State
既存のコードベースなし（グリーンフィールド）。

## Desired Outcome
- タスクの追加・編集・完了・削除ができる
- 期限日と優先度（高/中/低）を設定・確認できる
- フィルタリング・ソートでタスクを整理できる
- ブラウザを閉じてもデータが保持される（localStorage）
- モダンで洗練されたUIで快適に操作できる

## Approach
React 19 + TypeScript 5 + Vite 6 による SPA。shadcn/ui + Tailwind CSS v4 でモダンな UI を構築し、Zustand（persist ミドルウェア）で localStorage への永続化を行う。Zod でデータスキーマを定義し型安全性を確保する。motion（旧 Framer Motion v12+）でスムーズなアニメーションを付与する。

## Scope
- **In**:
  - タスク CRUD（追加・編集・完了チェック・削除）
  - 期限日の設定と表示（期限切れ検知）
  - 優先度設定（高 / 中 / 低）とバッジ表示
  - フィルタリング（全て / 未完了 / 完了済み / 期限切れ）
  - ソート（期限日・優先度・作成日）
  - localStorage による永続化（Zustand persist）
  - レスポンシブデザイン（モバイル対応）
  - アニメーション（リスト追加・削除・完了トグル）
  - Vitest による単体テスト

- **Out**:
  - ユーザー認証・ログイン機能
  - バックエンド API・データベース
  - 複数ユーザーによる共有・コラボレーション
  - プッシュ通知・リマインダー
  - モバイルアプリ（iOS / Android）
  - サブタスク・階層構造

## Boundary Candidates
- **UI レイヤー**: shadcn/ui コンポーネント + Tailwind v4 スタイリング
- **状態管理レイヤー**: Zustand store（todos スライス）+ persist ミドルウェア
- **ドメインロジック**: Zod スキーマ、カスタムフック（`useTodos`, `useFilters`, `useSortedTodos`）
- **永続化レイヤー**: localStorage アダプター（Zustand persist で抽象化）

## Out of Boundary
- このスペックはバックエンドや認証を所有しない
- Notion / 外部サービス連携は対象外
- E2E テスト（Playwright 等）は対象外

## Upstream / Downstream
- **Upstream**: なし（グリーンフィールド）
- **Downstream**: 将来的にバックエンド API を追加する場合、永続化レイヤーを localStorage から API クライアントに差し替えられる設計にする

## Existing Spec Touchpoints
- **Extends**: なし
- **Adjacent**: なし

## Tech Stack
| カテゴリ | 技術 | バージョン |
|---|---|---|
| フレームワーク | React | 19 |
| 言語 | TypeScript | 5.x |
| ビルドツール | Vite | 6 |
| スタイリング | Tailwind CSS | v4 |
| UIコンポーネント | shadcn/ui | latest |
| 状態管理 | Zustand | latest |
| バリデーション | Zod | latest |
| アニメーション | motion (旧 Framer Motion) | v12+ |
| テスト | Vitest + Testing Library | latest |
| パッケージ管理 | pnpm | latest |

## Architecture
```
src/
  features/
    todos/
      components/    # TodoItem, TodoList, TodoForm, TodoFilters
      hooks/         # useTodos, useFilters, useSortedTodos
      store/         # Zustand store with persist
      types/         # Todo型定義（Zodスキーマから生成）
  shared/
    components/      # shadcn/ui ラッパー、共通コンポーネント
    lib/             # utils, date helpers
  app/
    App.tsx
    main.tsx
```

## Constraints
- ブラウザ標準の localStorage のみ（バックエンド不要）
- React 19 対応のため `framer-motion` ではなく `motion` パッケージを使用
- shadcn/ui は Tailwind v4 + React 19 対応版を使用
