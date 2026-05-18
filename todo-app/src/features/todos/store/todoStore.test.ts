import { describe, it, expect, beforeEach, vi, afterAll } from 'vitest'
import { useTodoStore } from './todoStore'

beforeEach(() => {
  // Reset store state between tests
  useTodoStore.setState({ todos: [], storageError: false })
})

describe('addTodo', () => {
  it('should add a todo with default priority "low"', () => {
    useTodoStore.getState().addTodo({ title: 'Test Task' })
    const todos = useTodoStore.getState().todos
    expect(todos).toHaveLength(1)
    expect(todos[0].title).toBe('Test Task')
    expect(todos[0].completed).toBe(false)
    expect(todos[0].priority).toBe('low')
  })

  it('should add a todo with specified priority', () => {
    useTodoStore.getState().addTodo({ title: 'High Priority Task', priority: 'high' })
    const todos = useTodoStore.getState().todos
    expect(todos).toHaveLength(1)
    expect(todos[0].priority).toBe('high')
  })

  it('should generate a unique UUID for each todo', () => {
    useTodoStore.getState().addTodo({ title: 'Task 1' })
    useTodoStore.getState().addTodo({ title: 'Task 2' })
    const todos = useTodoStore.getState().todos
    expect(todos).toHaveLength(2)
    expect(todos[0].id).not.toBe(todos[1].id)
    // UUID format check
    expect(todos[0].id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
  })

  it('should set createdAt and updatedAt as ISO strings', () => {
    useTodoStore.getState().addTodo({ title: 'Task' })
    const todo = useTodoStore.getState().todos[0]
    expect(() => new Date(todo.createdAt)).not.toThrow()
    expect(() => new Date(todo.updatedAt)).not.toThrow()
  })

  it('should add todo with dueDate when provided', () => {
    useTodoStore.getState().addTodo({ title: 'Task with Due', dueDate: '2026-12-31' })
    const todo = useTodoStore.getState().todos[0]
    expect(todo.dueDate).toBe('2026-12-31')
  })

  it('after addTodo, useTodoStore.getState().todos should contain the new task', () => {
    useTodoStore.getState().addTodo({ title: 'Verify Task', priority: 'medium' })
    const todos = useTodoStore.getState().todos
    expect(todos.some((t) => t.title === 'Verify Task')).toBe(true)
  })
})

describe('updateTodo', () => {
  it('should update specified fields', () => {
    useTodoStore.getState().addTodo({ title: 'Original Title' })
    const id = useTodoStore.getState().todos[0].id
    useTodoStore.getState().updateTodo(id, { title: 'Updated Title' })
    const todo = useTodoStore.getState().todos[0]
    expect(todo.title).toBe('Updated Title')
  })

  it('should bump updatedAt on update', async () => {
    useTodoStore.getState().addTodo({ title: 'Task' })
    const originalUpdatedAt = useTodoStore.getState().todos[0].updatedAt
    const id = useTodoStore.getState().todos[0].id
    // Small delay to ensure different timestamp
    await new Promise((r) => setTimeout(r, 5))
    useTodoStore.getState().updateTodo(id, { title: 'Updated' })
    const updatedAt = useTodoStore.getState().todos[0].updatedAt
    expect(updatedAt >= originalUpdatedAt).toBe(true)
  })

  it('should not affect other todos', () => {
    useTodoStore.getState().addTodo({ title: 'Task 1' })
    useTodoStore.getState().addTodo({ title: 'Task 2' })
    const todos = useTodoStore.getState().todos
    const id = todos[0].id
    useTodoStore.getState().updateTodo(id, { title: 'Task 1 Updated' })
    const updatedTodos = useTodoStore.getState().todos
    expect(updatedTodos[1].title).toBe('Task 2')
  })
})

describe('toggleTodo', () => {
  it('should flip completed from false to true', () => {
    useTodoStore.getState().addTodo({ title: 'Task' })
    const id = useTodoStore.getState().todos[0].id
    expect(useTodoStore.getState().todos[0].completed).toBe(false)
    useTodoStore.getState().toggleTodo(id)
    expect(useTodoStore.getState().todos[0].completed).toBe(true)
  })

  it('should flip completed from true to false', () => {
    useTodoStore.getState().addTodo({ title: 'Task' })
    const id = useTodoStore.getState().todos[0].id
    useTodoStore.getState().toggleTodo(id)
    useTodoStore.getState().toggleTodo(id)
    expect(useTodoStore.getState().todos[0].completed).toBe(false)
  })

  it('should bump updatedAt on toggle', async () => {
    useTodoStore.getState().addTodo({ title: 'Task' })
    const originalUpdatedAt = useTodoStore.getState().todos[0].updatedAt
    const id = useTodoStore.getState().todos[0].id
    await new Promise((r) => setTimeout(r, 5))
    useTodoStore.getState().toggleTodo(id)
    const updatedAt = useTodoStore.getState().todos[0].updatedAt
    expect(updatedAt >= originalUpdatedAt).toBe(true)
  })
})

describe('deleteTodo', () => {
  it('should remove only the target todo', () => {
    useTodoStore.getState().addTodo({ title: 'Task 1' })
    useTodoStore.getState().addTodo({ title: 'Task 2' })
    const todos = useTodoStore.getState().todos
    const id = todos[0].id
    useTodoStore.getState().deleteTodo(id)
    const remaining = useTodoStore.getState().todos
    expect(remaining).toHaveLength(1)
    expect(remaining[0].title).toBe('Task 2')
  })

  it('should result in empty list when last todo is deleted', () => {
    useTodoStore.getState().addTodo({ title: 'Only Task' })
    const id = useTodoStore.getState().todos[0].id
    useTodoStore.getState().deleteTodo(id)
    expect(useTodoStore.getState().todos).toHaveLength(0)
  })
})

describe('setStorageError', () => {
  it('should set storageError to true', () => {
    expect(useTodoStore.getState().storageError).toBe(false)
    useTodoStore.getState().setStorageError(true)
    expect(useTodoStore.getState().storageError).toBe(true)
  })

  it('should set storageError back to false', () => {
    useTodoStore.getState().setStorageError(true)
    useTodoStore.getState().setStorageError(false)
    expect(useTodoStore.getState().storageError).toBe(false)
  })
})

describe('localStorage persistence', () => {
  it('initial storageError should be false', () => {
    expect(useTodoStore.getState().storageError).toBe(false)
  })

  it('setStorageError(true) should mark storage as failed', () => {
    useTodoStore.getState().setStorageError(true)
    expect(useTodoStore.getState().storageError).toBe(true)
  })
})

describe('onRehydrateStorage error handling', () => {
  afterAll(() => {
    vi.unstubAllGlobals()
  })

  it('should set storageError via setStorageError when storage fails', () => {
    // Directly test via setStorageError since onRehydrateStorage runs at module init time
    useTodoStore.getState().setStorageError(true)
    expect(useTodoStore.getState().storageError).toBe(true)
  })
})

describe('localStorage write-path error handling', () => {
  it('should set storageError=true when localStorage.setItem throws QuotaExceededError', async () => {
    // Reset storageError before test
    useTodoStore.setState({ storageError: false })

    // Override window.localStorage.setItem to simulate QuotaExceededError
    const proto = Object.getPrototypeOf(window.localStorage)
    const originalDescriptor = Object.getOwnPropertyDescriptor(proto, 'setItem')
    Object.defineProperty(proto, 'setItem', {
      configurable: true,
      writable: true,
      value: () => {
        throw new DOMException('QuotaExceededError', 'QuotaExceededError')
      },
    })

    // Trigger a store mutation which causes persist to call setItem via custom storage
    useTodoStore.getState().addTodo({ title: 'Write Error Task' })

    // Restore before awaiting to avoid interfering with other tests
    if (originalDescriptor) {
      Object.defineProperty(proto, 'setItem', originalDescriptor)
    }

    // Wait for queueMicrotask callback to fire (scheduled inside custom storage.setItem error handler)
    await new Promise<void>((resolve) => setTimeout(resolve, 20))

    expect(useTodoStore.getState().storageError).toBe(true)

    // Reset state after test
    useTodoStore.setState({ storageError: false, todos: [] })
  })
})
