import { useState } from 'react'
import { motion } from 'motion/react'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { isOverdue, formatDate } from '@/shared/lib/dateHelpers'
import { TodoForm } from '@/features/todos/components/TodoForm'
import type { Todo, UpdateTodoInput } from '@/features/todos/types/todo'

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onUpdate: (id: string, updates: UpdateTodoInput) => void
  onDelete: (id: string) => void
}

const priorityLabel: Record<Todo['priority'], string> = {
  high: '高',
  medium: '中',
  low: '低',
}

const priorityClassName: Record<Todo['priority'], string> = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800',
}

export function TodoItem({ todo, onToggle, onUpdate, onDelete }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)

  const handleUpdate = (updates: UpdateTodoInput) => {
    onUpdate(todo.id, updates)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div>
        <TodoForm
          mode="edit"
          initialTodo={todo}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    )
  }

  const overdueFlag = !todo.completed && isOverdue(todo.dueDate)
  const formattedDate = formatDate(todo.dueDate)

  return (
    <motion.div
      animate={{ opacity: todo.completed ? 0.6 : 1, scale: todo.completed ? 0.98 : 1 }}
      transition={{ duration: 0.2 }}
      className="flex items-start gap-3 rounded-md border p-3"
    >
      {/* チェックボックス */}
      <Checkbox
        checked={todo.completed}
        onCheckedChange={() => onToggle(todo.id)}
        aria-label={`完了: ${todo.title}`}
      />

      {/* メインコンテンツ */}
      <div className="flex flex-1 flex-col gap-1">
        {/* タイトル */}
        <span
          className={todo.completed ? 'line-through text-muted-foreground' : ''}
        >
          {todo.title}
        </span>

        {/* メタ情報行 */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 優先度バッジ */}
          <Badge className={priorityClassName[todo.priority]}>
            {priorityLabel[todo.priority]}
          </Badge>

          {/* 期限日表示 */}
          {todo.dueDate && (
            <span data-testid="due-date-display" className="text-sm text-muted-foreground">
              {formattedDate}
            </span>
          )}

          {/* 期限切れインジケーター */}
          {overdueFlag && (
            <span
              data-testid="overdue-indicator"
              className="flex items-center gap-1 text-sm font-medium text-red-600"
            >
              ⚠ 期限切れ
            </span>
          )}
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(true)}
        >
          編集
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => onDelete(todo.id)}
        >
          削除
        </Button>
      </div>
    </motion.div>
  )
}
