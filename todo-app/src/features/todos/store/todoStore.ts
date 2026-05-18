import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { CreateTodoInputSchema } from '../types/todo'
import type { Todo, CreateTodoInput, UpdateTodoInput } from '../types/todo'

interface TodoState {
  todos: Todo[]
  storageError: boolean
}

interface TodoActions {
  addTodo: (input: CreateTodoInput) => void
  updateTodo: (id: string, updates: UpdateTodoInput) => void
  toggleTodo: (id: string) => void
  deleteTodo: (id: string) => void
  setStorageError: (error: boolean) => void
}

type TodoStore = TodoState & TodoActions

export const useTodoStore = create<TodoStore>()(
  persist(
    (set) => ({
      todos: [],
      storageError: false,
      addTodo: (input) => {
        const parsed = CreateTodoInputSchema.parse(input)
        set((state) => ({
          todos: [
            ...state.todos,
            {
              id: crypto.randomUUID(),
              title: parsed.title,
              completed: false,
              priority: parsed.priority,
              dueDate: parsed.dueDate,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        }))
      },
      updateTodo: (id, updates) =>
        set((state) => ({
          todos: state.todos.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
          ),
        })),
      toggleTodo: (id) =>
        set((state) => ({
          todos: state.todos.map((t) =>
            t.id === id
              ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() }
              : t
          ),
        })),
      deleteTodo: (id) =>
        set((state) => ({ todos: state.todos.filter((t) => t.id !== id) })),
      setStorageError: (error) => set({ storageError: error }),
    }),
    {
      name: 'todo-app-storage',
      storage: createJSONStorage(() => ({
        getItem: (name: string): string | null => {
          try {
            return window.localStorage.getItem(name)
          } catch {
            return null
          }
        },
        setItem: (name: string, value: string): void => {
          try {
            window.localStorage.setItem(name, value)
          } catch {
            queueMicrotask(() => {
              useTodoStore.getState().setStorageError(true)
            })
          }
        },
        removeItem: (name: string): void => {
          try {
            window.localStorage.removeItem(name)
          } catch {
            /* noop */
          }
        },
      })),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          state?.setStorageError(true)
        }
      },
    }
  )
)
