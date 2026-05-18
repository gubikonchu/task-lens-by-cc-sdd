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
    <div>
      {storageError && (
        <div role="alert">
          データの保存に失敗しました。セッション内での操作は継続できます。
        </div>
      )}
      <h1>タスク管理</h1>
      <TodoForm
        mode="add"
        onSubmit={(input) => addTodo(input as CreateTodoInput)}
      />
      <TodoFilters currentFilter={filter} onFilterChange={setFilter} />
      <TodoSort currentSort={sort} onSortChange={setSort} />
      <TodoList
        todos={filteredTodos}
        currentFilter={filter}
        onToggle={toggleTodo}
        onUpdate={updateTodo}
        onDelete={deleteTodo}
      />
    </div>
  )
}

export default App
