import { useRef, useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  CreateTodoInputSchema,
  type CreateTodoInput,
  type Priority,
  type Todo,
  type UpdateTodoInput,
} from '@/features/todos/types/todo'

type TodoFormMode = 'add' | 'edit'

interface TodoFormProps {
  mode: TodoFormMode
  initialTodo?: Todo
  onSubmit: (input: CreateTodoInput | UpdateTodoInput) => void
  onCancel?: () => void
}

export function TodoForm({ mode, initialTodo, onSubmit, onCancel }: TodoFormProps) {
  const [title, setTitle] = useState(initialTodo?.title ?? '')
  const [dueDate, setDueDate] = useState(initialTodo?.dueDate ?? '')
  const [priority, setPriority] = useState<Priority>(initialTodo?.priority ?? 'low')
  const [errors, setErrors] = useState<{ title?: string }>({})
  const titleRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const result = CreateTodoInputSchema.safeParse({
      title,
      dueDate: dueDate || undefined,
      priority,
    })

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors
      setErrors({
        title: fieldErrors.title?.[0],
      })
      return
    }

    setErrors({})
    onSubmit(result.data)

    if (mode === 'add') {
      setTitle('')
      setDueDate('')
      setPriority('low')
      titleRef.current?.focus()
    }
  }

  const isEditMode = mode === 'edit'
  const submitLabel = isEditMode ? '保存' : '追加'

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Label htmlFor="todo-title">タイトル</Label>
        <Input
          id="todo-title"
          ref={titleRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-invalid={!!errors.title}
          className="w-full min-h-[44px]"
        />
        {errors.title && (
          <p role="alert" aria-live="polite">
            {errors.title}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="todo-due-date">期限日</Label>
        <Input
          id="todo-due-date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full min-h-[44px]"
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="todo-priority">優先度</Label>
        <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
          <SelectTrigger id="todo-priority" aria-label="優先度" className="w-full min-h-[44px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high">高</SelectItem>
            <SelectItem value="medium">中</SelectItem>
            <SelectItem value="low">低</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Button type="submit" className="w-full sm:w-auto min-h-[44px]">{submitLabel}</Button>
        {isEditMode && onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto min-h-[44px]">
            キャンセル
          </Button>
        )}
      </div>
    </form>
  )
}
