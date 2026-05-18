/**
 * Task 2.3 — useFilteredSortedTodos フック
 *
 * todos 配列を filter → sort の順に処理して返す純粋計算フック。
 * useMemo により todos / filter / sort のいずれかが変化した場合のみ再計算する。
 *
 * Feature Flag: ENABLE_FILTERED_SORTED_TODOS
 * - true  (デフォルト ON): フィルター + ソートを適用して返す
 * - false : 全 todos をそのまま返す (フォールバック)
 */
import { useMemo } from 'react'
import type { Todo, FilterType, SortField } from '../types/todo'
import {
  isOverdue,
  compareDates,
  PRIORITY_ORDER,
} from '@/shared/lib/dateHelpers'

// ---------------------------------------------------------------------------
// Feature Flag
// ---------------------------------------------------------------------------
export const ENABLE_FILTERED_SORTED_TODOS = true

// ---------------------------------------------------------------------------
// フィルター
// ---------------------------------------------------------------------------

function applyFilter(todos: Todo[], filter: FilterType): Todo[] {
  switch (filter) {
    case 'all':
      return todos
    case 'active':
      return todos.filter((t) => !t.completed)
    case 'completed':
      return todos.filter((t) => t.completed)
    case 'overdue':
      return todos.filter((t) => !t.completed && isOverdue(t.dueDate))
    default:
      return todos
  }
}

// ---------------------------------------------------------------------------
// ソート
// ---------------------------------------------------------------------------

function applySort(todos: Todo[], sort: SortField): Todo[] {
  // 元の配列を破壊しないようにコピーしてソート
  return [...todos].sort((a, b) => {
    switch (sort) {
      case 'dueDate':
        // 昇順: undefined は末尾
        return compareDates(a.dueDate, b.dueDate)
      case 'priority':
        // 降順（high が先頭）: PRIORITY_ORDER が小さいほど高優先度
        return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
      case 'createdAt':
        // 降順（最新が先頭）
        if (a.createdAt > b.createdAt) return -1
        if (a.createdAt < b.createdAt) return 1
        return 0
      default:
        return 0
    }
  })
}

// ---------------------------------------------------------------------------
// フック本体
// ---------------------------------------------------------------------------

/**
 * todos を filter → sort の順に処理して返すフック。
 *
 * @param todos  処理対象の Todo 配列
 * @param filter フィルター種別 ('all' | 'active' | 'completed' | 'overdue')
 * @param sort   ソート基準 ('dueDate' | 'priority' | 'createdAt')
 * @returns フィルタリングおよびソート済みの Todo 配列 (useMemo でメモ化)
 */
export function useFilteredSortedTodos(
  todos: Todo[],
  filter: FilterType,
  sort: SortField,
): Todo[] {
  return useMemo(() => {
    if (!ENABLE_FILTERED_SORTED_TODOS) {
      return todos
    }
    const filtered = applyFilter(todos, filter)
    return applySort(filtered, sort)
  }, [todos, filter, sort])
}
