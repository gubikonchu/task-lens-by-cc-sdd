import { motion, AnimatePresence } from 'motion/react'
import { TodoItem } from '@/features/todos/components/TodoItem'
import type { Todo, FilterType, UpdateTodoInput } from '@/features/todos/types/todo'

interface TodoListProps {
  todos: Todo[]
  currentFilter: FilterType
  onToggle: (id: string) => void
  onUpdate: (id: string, updates: UpdateTodoInput) => void
  onDelete: (id: string) => void
}

const FILTER_LABELS: Record<FilterType, string> = {
  all: '全て',
  active: '未完了',
  completed: '完了済み',
  overdue: '期限切れ',
}

export function TodoList({
  todos,
  currentFilter,
  onToggle,
  onUpdate,
  onDelete,
}: TodoListProps) {
  if (todos.length === 0) {
    return (
      <p>{FILTER_LABELS[currentFilter]} に該当するタスクがありません</p>
    )
  }

  return (
    <ul>
      <AnimatePresence>
        {todos.map((todo) => (
          <motion.li
            key={todo.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <TodoItem
              todo={todo}
              onToggle={onToggle}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  )
}
