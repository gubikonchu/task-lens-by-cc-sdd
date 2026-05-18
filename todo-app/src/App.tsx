/**
 * Task 4.1 — App.tsx ルートコンポーネント（全体統合）
 *
 * - filter / sort の useState を保有
 * - useTodos() / useFilteredSortedTodos() を呼び出し各コンポーネントへ渡す
 * - storageError が true のとき画面上部に永続化失敗の警告バナーを表示する
 * - useTodoStore.persist.hasHydrated() が false の間ローディングインジケーターを表示する
 *
 * Requirements: 7.4, 9.2, 9.3, 10.2
 */
import { useState } from 'react'
import { useTodos } from '@/features/todos/hooks/useTodos'
import { useFilteredSortedTodos } from '@/features/todos/hooks/useFilteredSortedTodos'
import { useTodoStore } from '@/features/todos/store/todoStore'
import { TodoForm } from '@/features/todos/components/TodoForm'
import { TodoList } from '@/features/todos/components/TodoList'
import { TodoFilters } from '@/features/todos/components/TodoFilters'
import { TodoSort } from '@/features/todos/components/TodoSort'
import type { FilterType, SortField, CreateTodoInput } from '@/features/todos/types/todo'

function App() {
  const [filter, setFilter] = useState<FilterType>('all')
  const [sort, setSort] = useState<SortField>('createdAt')

  const { todos, storageError, addTodo, updateTodo, toggleTodo, deleteTodo } = useTodos()
  const filteredTodos = useFilteredSortedTodos(todos, filter, sort)
  const hasHydrated = useTodoStore.persist.hasHydrated()

  if (!hasHydrated) {
    return <div>読み込み中...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      {storageError && (
        <div role="alert" className="bg-destructive/10 text-destructive px-4 py-3 text-sm text-center">
          データの保存に失敗しました。セッション内での操作は継続できます。
        </div>
      )}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">タスク管理</h1>
        <div className="mb-6">
          <TodoForm
            mode="add"
            onSubmit={(input) => addTodo(input as CreateTodoInput)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <TodoFilters currentFilter={filter} onFilterChange={setFilter} />
          <TodoSort currentSort={sort} onSortChange={setSort} />
        </div>
        <TodoList
          todos={filteredTodos}
          currentFilter={filter}
          onToggle={toggleTodo}
          onUpdate={updateTodo}
          onDelete={deleteTodo}
        />
      </div>
    </div>
  )
}

export default App
