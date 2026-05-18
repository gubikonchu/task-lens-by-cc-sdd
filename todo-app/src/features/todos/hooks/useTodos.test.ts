import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTodos } from './useTodos'
import { useTodoStore } from '../store/todoStore'

// ストアをテスト間でリセットするためのヘルパー
function resetStore() {
  useTodoStore.setState({ todos: [], storageError: false })
}

describe('useTodos', () => {
  beforeEach(() => {
    resetStore()
  })

  describe('返り値の構造', () => {
    it('todos, storageError, addTodo, updateTodo, toggleTodo, deleteTodo を返すこと', () => {
      const { result } = renderHook(() => useTodos())

      expect(result.current).toHaveProperty('todos')
      expect(result.current).toHaveProperty('storageError')
      expect(result.current).toHaveProperty('addTodo')
      expect(result.current).toHaveProperty('updateTodo')
      expect(result.current).toHaveProperty('toggleTodo')
      expect(result.current).toHaveProperty('deleteTodo')
    })

    it('setStorageError を公開しないこと', () => {
      const { result } = renderHook(() => useTodos())

      expect(result.current).not.toHaveProperty('setStorageError')
    })

    it('todos の初期値が空配列であること', () => {
      const { result } = renderHook(() => useTodos())

      expect(result.current.todos).toEqual([])
    })

    it('storageError の初期値が false であること', () => {
      const { result } = renderHook(() => useTodos())

      expect(result.current.storageError).toBe(false)
    })
  })

  describe('addTodo', () => {
    it('タスクを追加できること', () => {
      const { result } = renderHook(() => useTodos())

      act(() => {
        result.current.addTodo({ title: 'テストタスク' })
      })

      expect(result.current.todos).toHaveLength(1)
      expect(result.current.todos[0].title).toBe('テストタスク')
      expect(result.current.todos[0].completed).toBe(false)
    })

    it('複数のタスクを追加できること', () => {
      const { result } = renderHook(() => useTodos())

      act(() => {
        result.current.addTodo({ title: 'タスク1' })
        result.current.addTodo({ title: 'タスク2' })
      })

      expect(result.current.todos).toHaveLength(2)
    })

    it('priority を指定してタスクを追加できること', () => {
      const { result } = renderHook(() => useTodos())

      act(() => {
        result.current.addTodo({ title: '高優先タスク', priority: 'high' })
      })

      expect(result.current.todos[0].priority).toBe('high')
    })

    it('dueDate を指定してタスクを追加できること', () => {
      const { result } = renderHook(() => useTodos())

      act(() => {
        result.current.addTodo({ title: '期限付きタスク', dueDate: '2026-12-31' })
      })

      expect(result.current.todos[0].dueDate).toBe('2026-12-31')
    })
  })

  describe('updateTodo', () => {
    it('タスクのタイトルを更新できること', () => {
      const { result } = renderHook(() => useTodos())

      act(() => {
        result.current.addTodo({ title: '元のタイトル' })
      })

      const id = result.current.todos[0].id

      act(() => {
        result.current.updateTodo(id, { title: '更新後タイトル' })
      })

      expect(result.current.todos[0].title).toBe('更新後タイトル')
    })

    it('存在しない ID を指定しても他のタスクに影響しないこと', () => {
      const { result } = renderHook(() => useTodos())

      act(() => {
        result.current.addTodo({ title: 'タスク' })
      })

      act(() => {
        result.current.updateTodo('non-existent-id', { title: '変更なし' })
      })

      expect(result.current.todos[0].title).toBe('タスク')
    })
  })

  describe('toggleTodo', () => {
    it('completed を false から true に切り替えられること', () => {
      const { result } = renderHook(() => useTodos())

      act(() => {
        result.current.addTodo({ title: 'トグルタスク' })
      })

      const id = result.current.todos[0].id
      expect(result.current.todos[0].completed).toBe(false)

      act(() => {
        result.current.toggleTodo(id)
      })

      expect(result.current.todos[0].completed).toBe(true)
    })

    it('completed を true から false に切り替えられること', () => {
      const { result } = renderHook(() => useTodos())

      act(() => {
        result.current.addTodo({ title: 'トグルタスク' })
      })

      const id = result.current.todos[0].id

      act(() => {
        result.current.toggleTodo(id)
      })

      act(() => {
        result.current.toggleTodo(id)
      })

      expect(result.current.todos[0].completed).toBe(false)
    })
  })

  describe('deleteTodo', () => {
    it('タスクを削除できること', () => {
      const { result } = renderHook(() => useTodos())

      act(() => {
        result.current.addTodo({ title: '削除するタスク' })
      })

      const id = result.current.todos[0].id

      act(() => {
        result.current.deleteTodo(id)
      })

      expect(result.current.todos).toHaveLength(0)
    })

    it('指定した ID のタスクのみ削除されること', () => {
      const { result } = renderHook(() => useTodos())

      act(() => {
        result.current.addTodo({ title: 'タスク1' })
        result.current.addTodo({ title: 'タスク2' })
      })

      const idToDelete = result.current.todos[0].id

      act(() => {
        result.current.deleteTodo(idToDelete)
      })

      expect(result.current.todos).toHaveLength(1)
      expect(result.current.todos[0].title).toBe('タスク2')
    })
  })

  describe('storageError', () => {
    it('ストアで storageError が true になると useTodos でも反映されること', () => {
      const { result } = renderHook(() => useTodos())

      expect(result.current.storageError).toBe(false)

      act(() => {
        useTodoStore.setState({ storageError: true })
      })

      expect(result.current.storageError).toBe(true)
    })
  })

  describe('リアクティビティ', () => {
    it('ストアの todos が更新されると useTodos の todos も更新されること', () => {
      const { result } = renderHook(() => useTodos())

      expect(result.current.todos).toHaveLength(0)

      act(() => {
        result.current.addTodo({ title: 'リアクティブテスト' })
      })

      expect(result.current.todos).toHaveLength(1)
    })
  })
})
