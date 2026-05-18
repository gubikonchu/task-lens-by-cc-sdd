# Research & Design Decisions

---
**Purpose**: Capture discovery findings, architectural investigations, and rationale that inform the technical design.

---

## Summary

- **Feature**: `todo-app`
- **Discovery Scope**: New Feature（グリーンフィールド SPA）
- **Key Findings**:
  - shadcn/ui が Tailwind v4 を正式サポート。`tailwind.config.js` は不要で、CSS-first 設定に移行（`@tailwindcss/vite` Vite プラグイン使用）。
  - motion v12 は React 19 を完全サポート。インポートパスは `framer-motion` ではなく `motion/react`。
  - Zustand v5 は React 19 を公式サポート。persist ミドルウェアは TypeScript の二重括弧パターン（`create<T>()(persist(...))`）が必須。
  - react-day-picker（shadcn Calendar コンポーネントが依存）に React 19 peer dep 問題があるが、pnpm の `peerDependencyRules` で回避可能。カレンダーコンポーネントは本プロジェクトでは不使用のため影響なし。

---

## Research Log

### shadcn/ui + Tailwind CSS v4 互換性

- **Context**: Tailwind v4 は CSS-first アプローチを採用し、v3 とは設定方法が大きく異なる。
- **Sources Consulted**: shadcn/ui 公式ドキュメント（Tailwind v4 対応版）、shadcn CLI ソースコード
- **Findings**:
  - `tailwind.config.js` は廃止。すべての設定を `@theme` / `@layer` CSS ディレクティブで記述
  - `@tailwindcss/vite` プラグインを使用（PostCSS プラグイン方式は非推奨）
  - shadcn CLI がプロジェクトを自動検出して CSS-first 設定を挿入
  - `tw-animate-css` を `@import` して使用（旧 `tailwindcss-animate` プラグインの代替）
  - shadcn コンポーネントは `forwardRef` を削除、`data-slot` 属性を使用
- **Implications**: `vite.config.ts` に `tailwindcss()` プラグインを追加、`index.css` に `@import "tailwindcss"` を記述する構成になる

### motion v12 API

- **Context**: `framer-motion` から `motion` パッケージへのリブランディングと React 19 対応を確認
- **Sources Consulted**: motion.dev 公式ドキュメント、アップグレードガイド
- **Findings**:
  - パッケージ名: `motion`（npm）
  - インポートパス: `import { motion, AnimatePresence } from "motion/react"`
  - React 19 concurrent rendering を完全サポート
  - v12 では mount アニメーションがマイクロタスクに移行（テスト時に `act()` が必要）
  - React API に破壊的変更なし
- **Implications**: テストコードで motion アニメーションをアサートする際は `await act(async () => { ... })` が必要

### Zustand v5 persist ミドルウェア

- **Context**: TypeScript で persist ミドルウェアを使用する際の型推論パターンを確認
- **Sources Consulted**: Zustand 公式ドキュメント、v5.0.10 リリースノート
- **Findings**:
  - `create<State>()(persist(...))` の二重括弧パターン必須（TypeScript 型推論のため）
  - `onRehydrateStorage: () => (state, error) => void` コールバックで復元エラーを捕捉可能
  - `localStorage` がデフォルトストレージ
  - `partialize` オプションで永続化するステートのサブセットを指定可能
  - `version` + `migrate` でスキーママイグレーションをサポート
- **Implications**: ストア型定義に `storageError: boolean` フィールドを追加し、復元失敗時にユーザーに通知する

### Vitest + Testing Library for React 19

- **Context**: React 19 対応のテスト設定を確認
- **Sources Consulted**: Vitest 公式ドキュメント、Testing Library v16 リリースノート
- **Findings**:
  - `@testing-library/react` v16 が React 19 を完全サポート
  - `jsdom` 環境を使用
  - `afterEach(() => cleanup())` が必要（v16 では自動では行われない）
  - motion v12 のアニメーションテストには `act()` または `vi.useFakeTimers()` が必要
- **Implications**: `src/test/setup.ts` に jest-dom マッチャーの登録と cleanup を設定

---

## Architecture Pattern Evaluation

| オプション | 説明 | 強み | 制限 | 採否 |
|------------|------|------|------|------|
| Feature-based (adopted) | feature/ 配下に domain・store・hooks・components を集約 | 高凝集、スケーラブル、境界明確 | 小規模プロジェクトには過剰な場合も | ✅ 採用 |
| Flat structure | src/ 直下に全ファイルを配置 | シンプル | スケールしない、境界不明確 | ❌ |
| Atomic Design | atoms/molecules/organisms の階層 | UI 再利用性高 | ドメインロジックとの結合が難しい | ❌ |

---

## Design Decisions

### Decision: useFilteredSortedTodos を単一フックに統合

- **Context**: 要件 7（フィルタリング）と要件 8（ソート）を別々のフックで扱うか統合するか
- **Alternatives Considered**:
  1. `useFilters` + `useSortedTodos` の 2 フック — 分離度高いが組み合わせロジックが散らばる
  2. `useFilteredSortedTodos` の 1 フック — フィルター後にソートを適用する一貫したパイプライン
- **Selected Approach**: 単一フック。引数として `(todos, filter, sort)` を受け取りメモ化した結果を返す
- **Rationale**: 要件 7.4「フィルターとソートを同時に適用できる」を自然に実現。テストも単体で完結する
- **Trade-offs**: フックが 2 責務を持つが、「フィルター後ソート」という順序は不変なので問題なし

### Decision: TodoForm を add/edit 共用コンポーネントに統合

- **Context**: タスク追加と編集で別コンポーネントを用意するかどうか
- **Alternatives Considered**:
  1. `TodoAddForm` と `TodoEditForm` を分離 — それぞれシンプルだが重複が多い
  2. `TodoForm` に `mode: 'add' | 'edit'` と `initialTodo?: Todo` prop — 差分のみ制御
- **Selected Approach**: 統合。`mode` prop と `initialTodo` prop でレンダリングを切り替える
- **Rationale**: フォームのバリデーションロジックとフィールド定義は完全に共通。DRY 原則に従う
- **Trade-offs**: コンポーネントが若干複雑になるが、テスト・変更コストが低い

### Decision: localStorage 直接利用ではなく Zustand persist を採用

- **Context**: 永続化レイヤーをカスタム実装するか、Zustand persist を採用するか
- **Alternatives Considered**:
  1. カスタム localStorage アダプター — 将来の差し替えが容易
  2. Zustand persist ミドルウェア — 設定のみで永続化を実現
- **Selected Approach**: Zustand persist を採用。ストアインターフェース経由でのみ読み書きするため、永続化の差し替えはストア設定変更のみで済む
- **Rationale**: 現要件に必要な機能を最小実装で実現。将来 API 差し替えが必要になった場合も、ストアの `storage` オプションを変更するだけで対応可能

### Decision: 日付計算に date-fns を使用しない

- **Context**: 日付比較・フォーマットに外部ライブラリが必要か
- **Alternatives Considered**:
  1. date-fns — 豊富な API、TypeScript 対応
  2. ネイティブ Date + Intl.DateTimeFormat — 依存なし
- **Selected Approach**: ネイティブのみ。必要な操作は「今日との比較（isOverdue）」と「表示フォーマット（yyyy/MM/dd）」のみで、date-fns は過剰
- **Trade-offs**: フォーマットの多言語対応は `Intl` で十分。タイムゾーン複雑性が出た場合は date-fns を後で追加

---

## Risks & Mitigations

- **motion v12 テスト非同期性** — アニメーション関連テストで偽陰性が出る可能性。`vi.useFakeTimers()` と `act()` を setup.ts に標準化して対処
- **shadcn コンポーネントの Tailwind v4 CSS クラス互換性** — バージョン固定と pnpm lockfile 管理で安定性を確保
- **Zustand hydration タイミング** — コンポーネントがマウント前に `todos` を参照すると空配列になる。`useTodoStore.persist.hasHydrated()` を使った hydration 待機処理を App.tsx に実装
- **localStorage クォータ超過** — 多数のタスクで `QuotaExceededError` が発生する可能性。エラーを `onRehydrateStorage` と `try/catch` で捕捉し、`storageError` フラグをセット

## References

- [shadcn/ui Tailwind v4 サポート](https://ui.shadcn.com/docs/tailwind-v4)
- [shadcn/ui Vite インストール手順](https://ui.shadcn.com/docs/installation/vite)
- [shadcn/ui React 19 対応ガイド](https://ui.shadcn.com/docs/react-19)
- [motion for React ドキュメント](https://motion.dev/docs/react)
- [motion アップグレードガイド](https://motion.dev/docs/react-upgrade-guide)
- [Zustand persist ミドルウェア](https://zustand.docs.pmnd.rs/reference/integrations/persisting-store-data)
- [Vite 公式ドキュメント](https://vite.dev/guide/)
