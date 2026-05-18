/**
 * Task 2.3 — useFilteredSortedTodos フックのテスト
 *
 * Feature Flag: ENABLE_FILTERED_SORTED_TODOS (デフォルト ON)
 * - true  → 実装を使用
 * - false → 全 todos をそのまま返す（フォールバック）
 */
import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useFilteredSortedTodos } from './useFilteredSortedTodos'
import type { Todo } from '../types/todo'

// ---------------------------------------------------------------------------
// テスト用ユーティリティ
// ---------------------------------------------------------------------------

// today = '2026-05-19' (テストデータの日付の基準)

/** Todo のファクトリ関数 */
function makeTodo(overrides: Partial<Todo> & { id: string }): Todo {
  return {
    title: 'テストタスク',
    completed: false,
    priority: 'low',
    createdAt: '2026-05-19T00:00:00.000Z',
    updatedAt: '2026-05-19T00:00:00.000Z',
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// テストデータ
// ---------------------------------------------------------------------------

const TODO_ALL: Todo[] = [
  makeTodo({ id: '1', title: 'タスクA', completed: false, priority: 'high', dueDate: '2026-06-01', createdAt: '2026-05-01T00:00:00.000Z', updatedAt: '2026-05-01T00:00:00.000Z' }),
  makeTodo({ id: '2', title: 'タスクB', completed: true,  priority: 'medium', dueDate: '2026-05-10', createdAt: '2026-05-02T00:00:00.000Z', updatedAt: '2026-05-02T00:00:00.000Z' }),
  makeTodo({ id: '3', title: 'タスクC', completed: false, priority: 'low',  dueDate: '2026-05-05', createdAt: '2026-05-03T00:00:00.000Z', updatedAt: '2026-05-03T00:00:00.000Z' }),
  makeTodo({ id: '4', title: 'タスクD', completed: false, priority: 'medium', createdAt: '2026-05-04T00:00:00.000Z', updatedAt: '2026-05-04T00:00:00.000Z' }), // dueDate なし
]

// overdue: 2026-05-19 より前の日付かつ未完了
// タスクC: dueDate '2026-05-05' < '2026-05-19' && completed=false → overdue
// タスクB: dueDate '2026-05-10' < '2026-05-19' && completed=true → overdue ではない (完了済み)
// タスクA: dueDate '2026-06-01' >= '2026-05-19' → overdue ではない
// タスクD: dueDate なし → overdue ではない

// ---------------------------------------------------------------------------
// フィルターテスト
// ---------------------------------------------------------------------------

describe('useFilteredSortedTodos — フィルター', () => {
  it("filter='all': 全タスクを返すこと", () => {
    const { result } = renderHook(() =>
      useFilteredSortedTodos(TODO_ALL, 'all', 'createdAt'),
    )
    expect(result.current).toHaveLength(4)
  })

  it("filter='active': completed=false のタスクのみ返すこと", () => {
    const { result } = renderHook(() =>
      useFilteredSortedTodos(TODO_ALL, 'active', 'createdAt'),
    )
    expect(result.current.every((t) => t.completed === false)).toBe(true)
    expect(result.current).toHaveLength(3) // A, C, D
  })

  it("filter='completed': completed=true のタスクのみ返すこと", () => {
    const { result } = renderHook(() =>
      useFilteredSortedTodos(TODO_ALL, 'completed', 'createdAt'),
    )
    expect(result.current.every((t) => t.completed === true)).toBe(true)
    expect(result.current).toHaveLength(1) // B
  })

  it("filter='overdue': !completed && isOverdue(dueDate) のタスクのみ返すこと", () => {
    const { result } = renderHook(() =>
      useFilteredSortedTodos(TODO_ALL, 'overdue', 'createdAt'),
    )
    // タスクC のみ該当
    expect(result.current).toHaveLength(1)
    expect(result.current[0].id).toBe('3')
  })

  it('フィルター結果が 0 件のとき空配列を返すこと', () => {
    const allCompleted = TODO_ALL.map((t) => ({ ...t, completed: true }))
    const { result } = renderHook(() =>
      useFilteredSortedTodos(allCompleted, 'active', 'createdAt'),
    )
    expect(result.current).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// ソートテスト
// ---------------------------------------------------------------------------

describe('useFilteredSortedTodos — ソート', () => {
  it("sort='priority': high → medium → low の順 (descending by PRIORITY_ORDER)", () => {
    const todos: Todo[] = [
      makeTodo({ id: '1', priority: 'low',    createdAt: '2026-05-01T00:00:00.000Z', updatedAt: '2026-05-01T00:00:00.000Z' }),
      makeTodo({ id: '2', priority: 'high',   createdAt: '2026-05-02T00:00:00.000Z', updatedAt: '2026-05-02T00:00:00.000Z' }),
      makeTodo({ id: '3', priority: 'medium', createdAt: '2026-05-03T00:00:00.000Z', updatedAt: '2026-05-03T00:00:00.000Z' }),
    ]
    const { result } = renderHook(() =>
      useFilteredSortedTodos(todos, 'all', 'priority'),
    )
    expect(result.current.map((t) => t.priority)).toEqual(['high', 'medium', 'low'])
  })

  it("sort='dueDate': 昇順、dueDate なしは末尾", () => {
    const todos: Todo[] = [
      makeTodo({ id: '1', dueDate: '2026-07-01', createdAt: '2026-05-01T00:00:00.000Z', updatedAt: '2026-05-01T00:00:00.000Z' }),
      makeTodo({ id: '2', dueDate: undefined,    createdAt: '2026-05-02T00:00:00.000Z', updatedAt: '2026-05-02T00:00:00.000Z' }),
      makeTodo({ id: '3', dueDate: '2026-06-01', createdAt: '2026-05-03T00:00:00.000Z', updatedAt: '2026-05-03T00:00:00.000Z' }),
    ]
    const { result } = renderHook(() =>
      useFilteredSortedTodos(todos, 'all', 'dueDate'),
    )
    expect(result.current.map((t) => t.id)).toEqual(['3', '1', '2'])
  })

  it("sort='createdAt': 降順（最新が先頭）", () => {
    const todos: Todo[] = [
      makeTodo({ id: '1', createdAt: '2026-05-01T00:00:00.000Z', updatedAt: '2026-05-01T00:00:00.000Z' }),
      makeTodo({ id: '2', createdAt: '2026-05-03T00:00:00.000Z', updatedAt: '2026-05-03T00:00:00.000Z' }),
      makeTodo({ id: '3', createdAt: '2026-05-02T00:00:00.000Z', updatedAt: '2026-05-02T00:00:00.000Z' }),
    ]
    const { result } = renderHook(() =>
      useFilteredSortedTodos(todos, 'all', 'createdAt'),
    )
    expect(result.current.map((t) => t.id)).toEqual(['2', '3', '1'])
  })
})

// ---------------------------------------------------------------------------
// フィルター + ソートの組み合わせ
// ---------------------------------------------------------------------------

describe('useFilteredSortedTodos — フィルター + ソートの組み合わせ', () => {
  it("filter='active' + sort='priority': 未完了タスクを priority 順で返すこと", () => {
    const { result } = renderHook(() =>
      useFilteredSortedTodos(TODO_ALL, 'active', 'priority'),
    )
    // 未完了: A(high), C(low), D(medium) → high, medium, low
    expect(result.current.map((t) => t.id)).toEqual(['1', '4', '3'])
    expect(result.current.every((t) => !t.completed)).toBe(true)
  })

  it("filter='overdue' + sort='dueDate': 期限切れを dueDate 昇順で返すこと", () => {
    const overdues: Todo[] = [
      makeTodo({ id: '1', completed: false, dueDate: '2026-05-10', createdAt: '2026-05-01T00:00:00.000Z', updatedAt: '2026-05-01T00:00:00.000Z' }),
      makeTodo({ id: '2', completed: false, dueDate: '2026-05-05', createdAt: '2026-05-02T00:00:00.000Z', updatedAt: '2026-05-02T00:00:00.000Z' }),
      makeTodo({ id: '3', completed: true,  dueDate: '2026-05-01', createdAt: '2026-05-03T00:00:00.000Z', updatedAt: '2026-05-03T00:00:00.000Z' }), // 完了済み → 除外
    ]
    const { result } = renderHook(() =>
      useFilteredSortedTodos(overdues, 'overdue', 'dueDate'),
    )
    expect(result.current.map((t) => t.id)).toEqual(['2', '1'])
  })
})

// ---------------------------------------------------------------------------
// メモ化テスト
// ---------------------------------------------------------------------------

describe('useFilteredSortedTodos — useMemo メモ化', () => {
  it('todos / filter / sort が変化しなければ同一の配列参照を返すこと', () => {
    const { result, rerender } = renderHook(() =>
      useFilteredSortedTodos(TODO_ALL, 'all', 'createdAt'),
    )
    const first = result.current
    rerender()
    expect(result.current).toBe(first)
  })

  it('filter が変化したとき新しい配列を返すこと', () => {
    let filter: 'all' | 'active' = 'all'
    const { result, rerender } = renderHook(() =>
      useFilteredSortedTodos(TODO_ALL, filter, 'createdAt'),
    )
    const first = result.current
    filter = 'active'
    rerender()
    expect(result.current).not.toBe(first)
  })

  it('todos が変化したとき新しい配列を返すこと', () => {
    let todos = [...TODO_ALL]
    const { result, rerender } = renderHook(() =>
      useFilteredSortedTodos(todos, 'all', 'createdAt'),
    )
    const first = result.current
    todos = [...TODO_ALL, makeTodo({ id: '5', createdAt: '2026-05-05T00:00:00.000Z', updatedAt: '2026-05-05T00:00:00.000Z' })]
    rerender()
    expect(result.current).not.toBe(first)
  })
})
