/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TodoItem } from './TodoItem'
import type { Todo, UpdateTodoInput } from '@/features/todos/types/todo'

// motion/react のモック（アニメーションはjsdomで無効化）
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { animate?: unknown; transition?: unknown }) => {
      const { animate: _a, transition: _t, ...rest } = props as Record<string, unknown>
      return <div {...rest as React.HTMLAttributes<HTMLDivElement>}>{children}</div>
    },
  },
}))

const baseTodo: Todo = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  title: 'テストタスク',
  completed: false,
  priority: 'medium',
  dueDate: undefined,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const overdueTodo: Todo = {
  ...baseTodo,
  dueDate: '2020-01-01', // 過去の日付 → 期限切れ
}

const futureTodo: Todo = {
  ...baseTodo,
  dueDate: '2099-12-31', // 未来の日付 → 期限切れでない
}

const completedTodo: Todo = {
  ...baseTodo,
  completed: true,
}

const highPriorityTodo: Todo = {
  ...baseTodo,
  priority: 'high',
}

const lowPriorityTodo: Todo = {
  ...baseTodo,
  priority: 'low',
}

type OnToggleFn = (id: string) => void
type OnUpdateFn = (id: string, updates: UpdateTodoInput) => void
type OnDeleteFn = (id: string) => void

function renderTodoItem(todo: Todo, overrides?: {
  onToggle?: OnToggleFn
  onUpdate?: OnUpdateFn
  onDelete?: OnDeleteFn
}) {
  const onToggle: OnToggleFn = overrides?.onToggle ?? vi.fn()
  const onUpdate: OnUpdateFn = overrides?.onUpdate ?? vi.fn()
  const onDelete: OnDeleteFn = overrides?.onDelete ?? vi.fn()
  const result = render(
    <TodoItem
      todo={todo}
      onToggle={onToggle}
      onUpdate={onUpdate}
      onDelete={onDelete}
    />
  )
  return { onToggle, onUpdate, onDelete, ...result }
}

describe('TodoItem', () => {
  // テスト 1: タイトルが正しくレンダリングされる
  it('タイトルが表示される', () => {
    renderTodoItem(baseTodo)
    expect(screen.getByText('テストタスク')).toBeInTheDocument()
  })

  // テスト 2: チェックボックスが存在し、クリックで onToggle が呼ばれる
  it('チェックボックスが存在し、クリックで onToggle が呼ばれる', () => {
    const onToggle = vi.fn()
    renderTodoItem(baseTodo, { onToggle })
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeInTheDocument()
    fireEvent.click(checkbox)
    expect(onToggle).toHaveBeenCalledWith(baseTodo.id)
  })

  // テスト 3: 編集ボタン押下で編集フォームが表示される
  it('編集ボタン押下で TodoForm が表示される', () => {
    renderTodoItem(baseTodo)
    const editButton = screen.getByRole('button', { name: /編集/i })
    fireEvent.click(editButton)
    // TodoForm が edit モードで表示されるはず（「保存」ボタンが出る）
    expect(screen.getByRole('button', { name: /保存/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /キャンセル/i })).toBeInTheDocument()
  })

  // テスト 4: 削除ボタン押下で onDelete が呼ばれる
  it('削除ボタン押下で onDelete が呼ばれる', () => {
    const onDelete = vi.fn()
    renderTodoItem(baseTodo, { onDelete })
    const deleteButton = screen.getByRole('button', { name: /削除/i })
    fireEvent.click(deleteButton)
    expect(onDelete).toHaveBeenCalledWith(baseTodo.id)
  })

  // テスト 5: 完了済みタスクのタイトルに取り消し線が適用される
  it('完了済みタスクのタイトルに取り消し線クラスが適用される', () => {
    renderTodoItem(completedTodo)
    const title = screen.getByText('テストタスク')
    expect(title).toHaveClass('line-through')
  })

  // テスト 5b: 未完了タスクのタイトルには取り消し線が適用されない
  it('未完了タスクのタイトルには取り消し線クラスが適用されない', () => {
    renderTodoItem(baseTodo)
    const title = screen.getByText('テストタスク')
    expect(title).not.toHaveClass('line-through')
  })

  // テスト 6: 期限切れタスクに期限切れインジケーターが表示される
  it('期限切れタスクに期限切れインジケーターが表示される', () => {
    renderTodoItem(overdueTodo)
    // 期限切れを示す要素が存在すること（テキストまたはアイコン）
    const overdueIndicator = screen.getByTestId('overdue-indicator')
    expect(overdueIndicator).toBeInTheDocument()
  })

  // テスト 7: dueDate なし → 期限切れインジケーターが非表示
  it('dueDate がない場合は期限切れインジケーターが表示されない', () => {
    renderTodoItem(baseTodo)
    expect(screen.queryByTestId('overdue-indicator')).not.toBeInTheDocument()
  })

  // テスト 7b: 未来の dueDate → 期限切れインジケーターが非表示
  it('未来の dueDate の場合は期限切れインジケーターが表示されない', () => {
    renderTodoItem(futureTodo)
    expect(screen.queryByTestId('overdue-indicator')).not.toBeInTheDocument()
  })

  // テスト 8: 優先度バッジが正しいラベルでレンダリングされる
  it('medium 優先度のバッジに「中」と表示される', () => {
    renderTodoItem(baseTodo)
    expect(screen.getByText('中')).toBeInTheDocument()
  })

  it('high 優先度のバッジに「高」と表示される', () => {
    renderTodoItem(highPriorityTodo)
    expect(screen.getByText('高')).toBeInTheDocument()
  })

  it('low 優先度のバッジに「低」と表示される', () => {
    renderTodoItem(lowPriorityTodo)
    expect(screen.getByText('低')).toBeInTheDocument()
  })

  // テスト 9: 編集モードで TodoForm がレンダリングされ、キャンセルで閉じる
  it('編集モードでキャンセルボタン押下すると TodoForm が非表示になる', () => {
    renderTodoItem(baseTodo)
    const editButton = screen.getByRole('button', { name: /編集/i })
    fireEvent.click(editButton)
    // 編集フォームが表示されている
    expect(screen.queryByRole('button', { name: /編集/i })).not.toBeInTheDocument()
    const cancelButton = screen.getByRole('button', { name: /キャンセル/i })
    fireEvent.click(cancelButton)
    // 編集フォームが非表示になる
    expect(screen.getByRole('button', { name: /編集/i })).toBeInTheDocument()
  })

  // テスト 10: 編集モードで onUpdate が正しい引数で呼ばれる
  it('編集フォームを送信すると onUpdate が呼ばれる', () => {
    const onUpdate = vi.fn()
    renderTodoItem(baseTodo, { onUpdate })
    const editButton = screen.getByRole('button', { name: /編集/i })
    fireEvent.click(editButton)
    // 保存ボタンをクリック（タイトルはそのままで有効）
    const saveButton = screen.getByRole('button', { name: /保存/i })
    fireEvent.click(saveButton)
    expect(onUpdate).toHaveBeenCalledWith(
      baseTodo.id,
      expect.objectContaining({ title: 'テストタスク' }) as UpdateTodoInput
    )
  })

  // dueDate が設定されている場合に期限日が表示される
  it('dueDate が設定されている場合に期限日が表示される', () => {
    renderTodoItem(futureTodo)
    // formatDate('2099-12-31') → '2099/12/31'
    expect(screen.getByText('2099/12/31')).toBeInTheDocument()
  })

  // dueDate が未設定の場合は期限日が表示されない
  it('dueDate が未設定の場合は期限日テキストが表示されない', () => {
    renderTodoItem(baseTodo)
    // dueDate フィールドが存在しないことを確認
    expect(screen.queryByTestId('due-date-display')).not.toBeInTheDocument()
  })

  // 完了済みタスクは期限切れであっても期限切れインジケーターを表示しない
  it('完了済みの期限切れタスクは期限切れインジケーターを表示しない', () => {
    const completedOverdue: Todo = { ...overdueTodo, completed: true }
    renderTodoItem(completedOverdue)
    expect(screen.queryByTestId('overdue-indicator')).not.toBeInTheDocument()
  })
})
