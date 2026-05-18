/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TodoList } from './TodoList'
import type { Todo } from '@/features/todos/types/todo'

// motion/react のモック（AnimatePresence / motion.li をjsdomで無効化）
vi.mock('motion/react', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    li: ({
      children,
      initial: _i,
      animate: _a,
      exit: _e,
      ...rest
    }: React.HTMLAttributes<HTMLLIElement> & {
      initial?: unknown
      animate?: unknown
      exit?: unknown
    }) => <li {...rest}>{children}</li>,
  },
}))

// TodoItem のモック（ネストされた複雑なレンダリングを回避）
vi.mock('@/features/todos/components/TodoItem', () => ({
  TodoItem: ({
    todo,
    onDelete,
  }: {
    todo: { id: string; title: string }
    onDelete: (id: string) => void
  }) => (
    <div data-testid={`todo-item-${todo.id}`} onClick={() => onDelete(todo.id)}>
      {todo.title}
    </div>
  ),
}))

const makeTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: '550e8400-e29b-41d4-a716-446655440001',
  title: 'テストタスク',
  completed: false,
  priority: 'low',
  dueDate: undefined,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
})

const noop = () => {}

describe('TodoList', () => {
  // テスト 1: todos が空で filter='all' のとき「全て に該当するタスクがありません」を表示する
  it('空リストで filter="all" のとき空メッセージを表示する', () => {
    render(
      <TodoList
        todos={[]}
        currentFilter="all"
        onToggle={noop}
        onUpdate={noop}
        onDelete={noop}
      />,
    )
    expect(
      screen.getByText('全て に該当するタスクがありません'),
    ).toBeInTheDocument()
  })

  // テスト 2: todos が空で filter='active' のとき「未完了 に該当するタスクがありません」を表示する
  it('空リストで filter="active" のとき正しい空メッセージを表示する', () => {
    render(
      <TodoList
        todos={[]}
        currentFilter="active"
        onToggle={noop}
        onUpdate={noop}
        onDelete={noop}
      />,
    )
    expect(
      screen.getByText('未完了 に該当するタスクがありません'),
    ).toBeInTheDocument()
  })

  // テスト 3: todos が空で filter='completed' のとき「完了済み に該当するタスクがありません」を表示する
  it('空リストで filter="completed" のとき正しい空メッセージを表示する', () => {
    render(
      <TodoList
        todos={[]}
        currentFilter="completed"
        onToggle={noop}
        onUpdate={noop}
        onDelete={noop}
      />,
    )
    expect(
      screen.getByText('完了済み に該当するタスクがありません'),
    ).toBeInTheDocument()
  })

  // テスト 4: todos が空で filter='overdue' のとき「期限切れ に該当するタスクがありません」を表示する
  it('空リストで filter="overdue" のとき正しい空メッセージを表示する', () => {
    render(
      <TodoList
        todos={[]}
        currentFilter="overdue"
        onToggle={noop}
        onUpdate={noop}
        onDelete={noop}
      />,
    )
    expect(
      screen.getByText('期限切れ に該当するタスクがありません'),
    ).toBeInTheDocument()
  })

  // テスト 5: todos がある場合は空メッセージを表示しない
  it('todos がある場合は空メッセージを表示しない', () => {
    const todos = [makeTodo()]
    render(
      <TodoList
        todos={todos}
        currentFilter="all"
        onToggle={noop}
        onUpdate={noop}
        onDelete={noop}
      />,
    )
    expect(
      screen.queryByText(/に該当するタスクがありません/),
    ).not.toBeInTheDocument()
  })

  // テスト 6: todos がある場合は ul + li でリストをレンダリングする
  it('todos がある場合は ul と li でリストをレンダリングする', () => {
    const todos = [makeTodo()]
    render(
      <TodoList
        todos={todos}
        currentFilter="all"
        onToggle={noop}
        onUpdate={noop}
        onDelete={noop}
      />,
    )
    expect(screen.getByRole('list')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
  })

  // テスト 7: 複数の todos がそれぞれ TodoItem としてレンダリングされる
  it('複数の todos がそれぞれ TodoItem としてレンダリングされる', () => {
    const todos = [
      makeTodo({ id: '550e8400-e29b-41d4-a716-446655440001', title: 'タスク1' }),
      makeTodo({ id: '550e8400-e29b-41d4-a716-446655440002', title: 'タスク2' }),
      makeTodo({ id: '550e8400-e29b-41d4-a716-446655440003', title: 'タスク3' }),
    ]
    render(
      <TodoList
        todos={todos}
        currentFilter="all"
        onToggle={noop}
        onUpdate={noop}
        onDelete={noop}
      />,
    )
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
    expect(screen.getByTestId('todo-item-550e8400-e29b-41d4-a716-446655440001')).toBeInTheDocument()
    expect(screen.getByTestId('todo-item-550e8400-e29b-41d4-a716-446655440002')).toBeInTheDocument()
    expect(screen.getByTestId('todo-item-550e8400-e29b-41d4-a716-446655440003')).toBeInTheDocument()
  })

  // テスト 8: 各 todo のタイトルが表示される
  it('各 todo のタイトルが表示される', () => {
    const todos = [
      makeTodo({ id: '550e8400-e29b-41d4-a716-446655440001', title: 'タスクA' }),
      makeTodo({ id: '550e8400-e29b-41d4-a716-446655440002', title: 'タスクB' }),
    ]
    render(
      <TodoList
        todos={todos}
        currentFilter="all"
        onToggle={noop}
        onUpdate={noop}
        onDelete={noop}
      />,
    )
    expect(screen.getByText('タスクA')).toBeInTheDocument()
    expect(screen.getByText('タスクB')).toBeInTheDocument()
  })
})
