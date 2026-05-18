import { useTodoStore } from '../store/todoStore'
import type { Todo, CreateTodoInput, UpdateTodoInput } from '../types/todo'

interface UseTodosReturn {
  todos: Todo[]
  storageError: boolean
  addTodo: (input: CreateTodoInput) => void
  updateTodo: (id: string, updates: UpdateTodoInput) => void
  toggleTodo: (id: string) => void
  deleteTodo: (id: string) => void
}

export function useTodos(): UseTodosReturn {
  const todos = useTodoStore((state) => state.todos)
  const storageError = useTodoStore((state) => state.storageError)
  const addTodo = useTodoStore((state) => state.addTodo)
  const updateTodo = useTodoStore((state) => state.updateTodo)
  const toggleTodo = useTodoStore((state) => state.toggleTodo)
  const deleteTodo = useTodoStore((state) => state.deleteTodo)

  return { todos, storageError, addTodo, updateTodo, toggleTodo, deleteTodo }
}
