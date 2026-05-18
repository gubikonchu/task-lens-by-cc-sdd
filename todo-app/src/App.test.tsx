/**
 * Task 4.1 — App.tsx 統合テスト
 *
 * App コンポーネントは全フック・全子コンポーネントを統合するルートコンポーネント。
 * フック・子コンポーネントをモックして App 自身のロジックのみを検証する。
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from './App'

// ---------------------------------------------------------------------------
// モック定義
// vi.mock はホイストされるため、ファクトリ内で外部変数を参照できない。
// vi.hoisted() でモック関数を事前定義する。
// ---------------------------------------------------------------------------

const { mockHasHydrated, mockUseTodos, mockUseFilteredSortedTodos } = vi.hoisted(() => ({
  mockHasHydrated: vi.fn(),
  mockUseTodos: vi.fn(),
  mockUseFilteredSortedTodos: vi.fn(),
}))

// useTodos フックのモック
vi.mock('@/features/todos/hooks/useTodos', () => ({
  useTodos: mockUseTodos,
}))

// useFilteredSortedTodos フックのモック
vi.mock('@/features/todos/hooks/useFilteredSortedTodos', () => ({
  useFilteredSortedTodos: mockUseFilteredSortedTodos,
}))

// todoStore のモック（persist.hasHydrated()）
vi.mock('@/features/todos/store/todoStore', () => ({
  useTodoStore: Object.assign(vi.fn(), {
    persist: {
      hasHydrated: mockHasHydrated,
    },
  }),
}))

// 子コンポーネントのモック（深いレンダリングを避ける）
vi.mock('@/features/todos/components/TodoForm', () => ({
  TodoForm: ({ onSubmit, mode }: { onSubmit: (v: unknown) => void; mode: string }) => (
    <button
      data-testid="todo-form"
      data-mode={mode}
      onClick={() => onSubmit({ title: 'テストタスク', priority: 'low' })}
    >
      TodoForm
    </button>
  ),
}))

vi.mock('@/features/todos/components/TodoList', () => ({
  TodoList: ({ todos, onToggle, onDelete }: {
    todos: { id: string; title: string }[]
    currentFilter: string
    onToggle: (id: string) => void
    onUpdate: (id: string, updates: unknown) => void
    onDelete: (id: string) => void
  }) => (
    <div data-testid="todo-list">
      {todos.map((t) => (
        <div key={t.id} data-testid={`todo-item-${t.id}`}>
          {t.title}
          <button onClick={() => onToggle(t.id)}>toggle-{t.id}</button>
          <button onClick={() => onDelete(t.id)}>delete-{t.id}</button>
        </div>
      ))}
    </div>
  ),
}))

vi.mock('@/features/todos/components/TodoFilters', () => ({
  TodoFilters: ({ onFilterChange }: { currentFilter: string; onFilterChange: (f: string) => void }) => (
    <button
      data-testid="todo-filters"
      onClick={() => onFilterChange('active')}
    >
      TodoFilters
    </button>
  ),
}))

vi.mock('@/features/todos/components/TodoSort', () => ({
  TodoSort: ({ onSortChange }: { currentSort: string; onSortChange: (s: string) => void }) => (
    <button
      data-testid="todo-sort"
      onClick={() => onSortChange('priority')}
    >
      TodoSort
    </button>
  ),
}))

// ---------------------------------------------------------------------------
// テストフィクスチャ
// ---------------------------------------------------------------------------

const mockTodos = [
  {
    id: 'id-1',
    title: 'タスク1',
    completed: false,
    priority: 'low' as const,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'id-2',
    title: 'タスク2',
    completed: true,
    priority: 'high' as const,
    createdAt: '2026-01-02T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  },
]

const mockAddTodo = vi.fn()
const mockUpdateTodo = vi.fn()
const mockToggleTodo = vi.fn()
const mockDeleteTodo = vi.fn()

// ---------------------------------------------------------------------------
// セットアップ
// ---------------------------------------------------------------------------

function setupMocks({
  hasHydrated = true,
  storageError = false,
  todos = mockTodos,
  filteredTodos = mockTodos,
} = {}) {
  mockHasHydrated.mockReturnValue(hasHydrated)
  mockUseTodos.mockReturnValue({
    todos,
    storageError,
    addTodo: mockAddTodo,
    updateTodo: mockUpdateTodo,
    toggleTodo: mockToggleTodo,
    deleteTodo: mockDeleteTodo,
  })
  mockUseFilteredSortedTodos.mockReturnValue(filteredTodos)
}

// ---------------------------------------------------------------------------
// テスト
// ---------------------------------------------------------------------------

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('ハイドレーション', () => {
    it('hasHydrated() が false のときローディングインジケーターを表示する', () => {
      setupMocks({ hasHydrated: false })
      render(<App />)
      expect(screen.getByText('読み込み中...')).toBeInTheDocument()
    })

    it('hasHydrated() が false のとき子コンポーネントを表示しない', () => {
      setupMocks({ hasHydrated: false })
      render(<App />)
      expect(screen.queryByTestId('todo-form')).not.toBeInTheDocument()
      expect(screen.queryByTestId('todo-list')).not.toBeInTheDocument()
    })

    it('hasHydrated() が true のときメインコンテンツを表示する', () => {
      setupMocks({ hasHydrated: true })
      render(<App />)
      expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument()
      expect(screen.getByTestId('todo-form')).toBeInTheDocument()
    })
  })

  describe('storageError バナー', () => {
    it('storageError が true のとき警告バナーを表示する', () => {
      setupMocks({ storageError: true })
      render(<App />)
      const alert = screen.getByRole('alert')
      expect(alert).toBeInTheDocument()
      expect(alert).toHaveTextContent('データの保存に失敗しました')
    })

    it('storageError が false のとき警告バナーを表示しない', () => {
      setupMocks({ storageError: false })
      render(<App />)
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  describe('子コンポーネントのレンダリング', () => {
    it('ハイドレーション後に TodoForm, TodoFilters, TodoSort, TodoList を表示する', () => {
      setupMocks()
      render(<App />)
      expect(screen.getByTestId('todo-form')).toBeInTheDocument()
      expect(screen.getByTestId('todo-filters')).toBeInTheDocument()
      expect(screen.getByTestId('todo-sort')).toBeInTheDocument()
      expect(screen.getByTestId('todo-list')).toBeInTheDocument()
    })

    it('TodoForm に mode="add" を渡す', () => {
      setupMocks()
      render(<App />)
      expect(screen.getByTestId('todo-form')).toHaveAttribute('data-mode', 'add')
    })

    it('filteredTodos を TodoList に渡す', () => {
      const filteredTodos = [mockTodos[0]]
      setupMocks({ filteredTodos })
      render(<App />)
      expect(screen.getByTestId('todo-item-id-1')).toBeInTheDocument()
      expect(screen.queryByTestId('todo-item-id-2')).not.toBeInTheDocument()
    })

    it('タイトル「タスク管理」を表示する', () => {
      setupMocks()
      render(<App />)
      expect(screen.getByRole('heading', { name: 'タスク管理' })).toBeInTheDocument()
    })
  })

  describe('フック連携', () => {
    it('TodoForm の onSubmit が呼ばれると addTodo を呼び出す', async () => {
      setupMocks()
      render(<App />)
      const user = userEvent.setup()
      await user.click(screen.getByTestId('todo-form'))
      expect(mockAddTodo).toHaveBeenCalledWith({ title: 'テストタスク', priority: 'low' })
    })

    it('toggleTodo を TodoList に渡す（onToggle 経由で呼び出せる）', async () => {
      setupMocks()
      render(<App />)
      const user = userEvent.setup()
      await user.click(screen.getByText('toggle-id-1'))
      expect(mockToggleTodo).toHaveBeenCalledWith('id-1')
    })

    it('deleteTodo を TodoList に渡す（onDelete 経由で呼び出せる）', async () => {
      setupMocks()
      render(<App />)
      const user = userEvent.setup()
      await user.click(screen.getByText('delete-id-2'))
      expect(mockDeleteTodo).toHaveBeenCalledWith('id-2')
    })
  })
})
