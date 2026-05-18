# Implementation Plan

- [ ] 1. Foundation: プロジェクトセットアップとテスト基盤
- [x] 1.1 Vite 6 + React 19 + TypeScript 5 プロジェクトを初期化する
  - `pnpm create vite@latest todo-app --template react-ts` でスキャフォールドを作成する
  - `package.json` に `pnpm.peerDependencyRules.allowedVersions` で React 19 の peer dep 競合を回避する
  - `tsconfig.app.json` に `"strict": true`, `"moduleResolution": "bundler"`, `"paths": { "@/*": ["./src/*"] }` を設定する
  - `vite.config.ts` に `@vitejs/plugin-react` と `resolve.alias` を追加する
  - `pnpm dev` でブラウザに Vite のデフォルト画面が表示されること

- [x] 1.2 Tailwind CSS v4 と shadcn/ui を設定する
  - `pnpm add tailwindcss @tailwindcss/vite` をインストールし、`vite.config.ts` に `tailwindcss()` プラグインを追加する
  - `src/index.css` に `@import "tailwindcss"` と shadcn デザイントークンを記述する
  - `pnpm dlx shadcn@latest init` を実行し、Button / Input / Badge / Select / Checkbox / Label コンポーネントを追加する
  - `src/shared/lib/utils.ts` に `cn()` ユーティリティを配置する
  - shadcn の Button コンポーネントが正しくスタイル適用されてレンダリングされること
  - _Requirements: 10.1_

- [x] 1.3 Vitest テスト環境を設定する
  - `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event` をインストールする
  - `vitest.config.ts` に `environment: 'jsdom'`, `globals: true`, `setupFiles: ['./src/test/setup.ts']` を設定する
  - `src/test/setup.ts` に `expect.extend(matchers)` と `afterEach(cleanup)` を記述する
  - `pnpm test` が実行でき、ダミーテスト（`expect(1).toBe(1)`）がパスすること
  - _Requirements: 12.1, 12.2, 12.3_

- [x] 1.4 Zod スキーマとドメイン型を定義する
  - `src/features/todos/types/todo.ts` に `PrioritySchema`, `TodoSchema`, `CreateTodoInputSchema`, `UpdateTodoInputSchema` を定義する
  - `Todo`, `Priority`, `CreateTodoInput`, `UpdateTodoInput`, `FilterType`, `SortField` 型をエクスポートする
  - `PrioritySchema.default('low')` により未指定時に `'low'` が設定されること
  - TypeScript コンパイルエラーなしにファイルがインポートできること
  - _Requirements: 1.2, 2.4, 6.1, 6.3_

- [x] 1.5 日付ヘルパーユーティリティを実装する
  - `src/shared/lib/dateHelpers.ts` に `isOverdue()`, `formatDate()`, `compareDates()`, `PRIORITY_ORDER` を実装する
  - `isOverdue(undefined)` → `false`、`isOverdue('2020-01-01')` → `true`、`isOverdue('2099-12-31')` → `false` になること
  - `formatDate(undefined)` → `''`、有効日付 → `'yyyy/MM/dd'` 形式になること
  - 外部ライブラリを使用せずブラウザ標準 `Date` と `Intl` のみで実装されること
  - _Requirements: 5.2, 5.3, 8.2_

---

- [ ] 2. Store とカスタムフックの実装
- [x] 2.1 Zustand Todo ストアを実装する（CRUD + localStorage 永続化）
  - `src/features/todos/store/todoStore.ts` に `useTodoStore` を実装する
  - `addTodo`, `updateTodo`, `toggleTodo`, `deleteTodo`, `setStorageError` アクションを定義する
  - Zustand `persist` ミドルウェアで `'todo-app-storage'` キーに localStorage 自動保存を設定する
  - `onRehydrateStorage` コールバックでエラーを捕捉し `storageError: true` をセットする
  - `addTodo` 実行後に `useTodoStore.getState().todos` に新しいタスクが含まれること
  - _Requirements: 1.1, 1.3, 2.2, 3.1, 3.2, 4.1, 6.3, 9.1, 9.2, 9.3_

- [x] 2.2 useTodos フックを実装する
  - `src/features/todos/hooks/useTodos.ts` に `useTodos()` を実装する
  - `useTodoStore` から `todos`, `storageError`, 全 CRUD アクションを取り出して返す
  - フックを呼び出すと `{ todos, storageError, addTodo, updateTodo, toggleTodo, deleteTodo }` オブジェクトが返ること
  - _Requirements: 1.1, 2.2, 3.1, 3.2, 4.1, 9.3_
  - _Depends: 2.1_

- [x] 2.3 (P) useFilteredSortedTodos フックを実装する
  - `src/features/todos/hooks/useFilteredSortedTodos.ts` に `useFilteredSortedTodos(todos, filter, sort)` を実装する
  - フィルターパイプライン（all / active / completed / overdue）を実装し、overdue は `!completed && isOverdue(dueDate)` で判定する
  - ソートパイプライン（dueDate 昇順・priority 降順・createdAt 降順）を filter の後に適用する
  - `useMemo` でメモ化し、`todos` / `filter` / `sort` のいずれかが変化した場合のみ再計算する
  - `filter='overdue'` のとき `isOverdue()` が true かつ `completed=false` のタスクのみ返ること
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 8.1, 8.2_
  - _Boundary: useFilteredSortedTodos フック_
  - _Depends: 1.4, 1.5_

---

- [ ] 3. UI コンポーネントの実装
- [x] 3.1 (P) TodoForm コンポーネントを実装する（追加・編集共用フォーム）
  - `src/features/todos/components/TodoForm.tsx` に `mode: 'add' | 'edit'` と `initialTodo?: Todo` prop を持つフォームを実装する
  - タイトル（必須テキスト）・期限日（date input、オプション）・優先度（Select、high/medium/low）の 3 フィールドを実装する
  - 送信時に `CreateTodoInputSchema.safeParse()` でバリデーションし、失敗時はフィールドレベルにエラーメッセージを表示する
  - add モード: 送信成功後にフォームフィールドをリセットしてタイトル入力にフォーカスを戻す
  - edit モード: `initialTodo` の値でフィールドを初期化し、キャンセルボタン押下で `onCancel` を呼び出す
  - 空タイトルで送信すると「タイトルは必須です」メッセージが表示され `onSubmit` が呼ばれないこと
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.3, 2.4, 6.1_
  - _Boundary: TodoForm コンポーネント_

- [x] 3.2 (P) TodoFilters と TodoSort コンポーネントを実装する
  - `src/features/todos/components/TodoFilters.tsx` に all / active / completed / overdue の 4 タブを実装する
  - `src/features/todos/components/TodoSort.tsx` に dueDate / priority / createdAt の Select を実装する
  - フィルタータブをクリックすると `onFilterChange` が正しい `FilterType` 値で呼び出されること
  - ソートを変更すると `onSortChange` が正しい `SortField` 値で呼び出されること
  - _Requirements: 7.1, 8.1_
  - _Boundary: TodoFilters, TodoSort コンポーネント_

- [x] 3.3 TodoItem コンポーネントを実装する
  - `src/features/todos/components/TodoItem.tsx` に単一タスクの表示・操作 UI を実装する
  - チェックボックス（完了トグル）・タイトル・優先度バッジ・期限日表示・編集ボタン・削除ボタンを配置する
  - `isOverdue(dueDate)` が true のとき期限切れスタイル（赤色テキスト + 警告アイコン）を表示し、未設定時は非表示にする
  - 完了済みタスクのタイトルに取り消し線を適用する
  - 編集ボタン押下で `isEditing` が true になり `TodoForm` を edit モードでレンダリングする
  - `motion.div` の opacity / scale トランジションで完了切り替えアニメーションを付与する
  - チェックボックスを操作すると完了状態がアニメーション付きで切り替わること
  - _Requirements: 2.1, 2.3, 3.1, 3.2, 3.3, 4.1, 5.1, 5.2, 5.3, 6.2, 6.3_
  - _Boundary: TodoItem コンポーネント_
  - _Depends: 3.1_

- [x] 3.4 TodoList コンポーネントを実装する（アニメーション付きリスト）
  - `src/features/todos/components/TodoList.tsx` に `AnimatePresence` を使ったリストを実装する
  - `todos` が空のとき「{currentFilter} に該当するタスクがありません」メッセージを表示する
  - `AnimatePresence` の各 `motion.li` に `initial` / `animate` / `exit` props でスライドイン・アウトアニメーションを設定する
  - タスク追加時にアイテムがアニメーションで現れ、削除時にアニメーションで消えること
  - _Requirements: 4.2, 7.3, 11.1, 11.2_
  - _Boundary: TodoList コンポーネント_
  - _Depends: 3.3_

---

- [ ] 4. App 統合と永続化エラー処理
- [x] 4.1 App.tsx でルートコンポーネントを実装する（全体統合）
  - `src/app/App.tsx` に `filter: FilterType` と `sort: SortField` の useState を追加する
  - `useTodos()` と `useFilteredSortedTodos()` を呼び出し、取得したデータを各コンポーネントへ props で渡す
  - `storageError` が true のとき画面上部に永続化失敗の警告バナーを表示する
  - `useTodoStore.persist.hasHydrated()` が false の間、ローディングインジケーターを表示する
  - ブラウザで全フィルター・ソートの組み合わせが動作し、タスクの追加・編集・完了・削除が一通り機能すること
  - _Requirements: 7.4, 9.2, 9.3, 10.2_
  - _Depends: 2.2, 2.3, 3.4_

- [x] 4.2 全コンポーネントにレスポンシブレイアウトを適用する
  - Tailwind v4 のレスポンシブプレフィックス（`sm:`, `md:`, `lg:`）を使ってレイアウトを調整する
  - モバイル幅（375px）でヘッダー・フォーム・リスト・フィルターが重ならずに表示されること
  - タッチ操作でチェックボックス・ボタン・Select が問題なく操作できるタップエリアを確保すること
  - _Requirements: 10.1, 10.2_

---

- [ ] 5. 単体テストの実装
- [x] 5.1 todoStore の単体テストを実装する（CRUD と永続化）
  - `addTodo` でタスクが追加され、デフォルト priority が `'low'` であることを検証する
  - `updateTodo` でタイトル・期限日・優先度が更新され、`updatedAt` が変化することを検証する
  - `toggleTodo` で `completed` フラグが切り替わることを検証する
  - `deleteTodo` で対象 ID のタスクのみが削除されることを検証する
  - `vi.stubGlobal` で localStorage をモックし、保存データの確認と localStorage エラー時に `storageError` が `true` になることを検証する
  - `pnpm test` で Store テストが全件パスすること
  - _Requirements: 12.1, 12.3_

- [x] 5.2 (P) useFilteredSortedTodos の単体テストを実装する（フィルタリングとソート）
  - `filter='active'` で `completed: false` のタスクのみ返ることを検証する
  - `filter='completed'` で `completed: true` のタスクのみ返ることを検証する
  - `filter='overdue'` で期限切れ（`isOverdue=true`）かつ未完了のタスクのみ返ることを検証する
  - `sort='priority'` で high → medium → low の順になることを検証する
  - `sort='dueDate'` で期限日昇順（未設定は末尾）になることを検証する
  - フィルター + ソートの組み合わせ結果が正しいことを検証する
  - `pnpm test` でフィルタリング・ソートテストが全件パスすること
  - _Requirements: 12.2_
  - _Boundary: useFilteredSortedTodos フック_

- [x] 5.3 (P) TodoForm のコンポーネントテストを実装する（バリデーションと動作）
  - 空タイトルで送信するとエラーメッセージが表示され、`onSubmit` が呼ばれないことを検証する
  - タイトルを入力して送信すると `onSubmit` が正しい入力値で呼ばれることを検証する
  - add モードで送信後にフォームがリセットされることを検証する
  - edit モードでキャンセルボタン押下時に `onCancel` が呼ばれることを検証する
  - `pnpm test` で TodoForm テストが全件パスすること
  - _Requirements: 12.1_
  - _Boundary: TodoForm コンポーネント_
