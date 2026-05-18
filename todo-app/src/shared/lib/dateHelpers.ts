import type { Priority } from '@/features/todos/types/todo'

/**
 * 指定した日付が今日より前（期限切れ）かどうかを判定する。
 * undefined の場合は false を返す。
 * 今日の日付は期限切れとみなさない（dueDate < today の場合のみ true）。
 */
export function isOverdue(dueDate: string | undefined): boolean {
  if (dueDate === undefined) return false
  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10) // 'YYYY-MM-DD'
  return dueDate < todayStr
}

/**
 * ISO 日付文字列 (YYYY-MM-DD) を 'yyyy/MM/dd' 形式に変換する。
 * undefined の場合は空文字列を返す。
 * タイムゾーンずれを防ぐため T00:00:00 を付加してパースする。
 */
export function formatDate(dueDate: string | undefined): string {
  if (dueDate === undefined) return ''
  const date = new Date(dueDate + 'T00:00:00')
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

/**
 * 2 つの ISO 日付文字列を昇順に比較する。
 * undefined は末尾扱い（Infinity 相当）。
 */
export function compareDates(
  a: string | undefined,
  b: string | undefined,
): number {
  const aVal = a ?? '￿' // undefined → ソート上の最大値
  const bVal = b ?? '￿'
  if (aVal < bVal) return -1
  if (aVal > bVal) return 1
  return 0
}

/**
 * 優先度の表示・ソート用順序マップ。
 * high=0（最高）, medium=1, low=2（最低）。
 */
export const PRIORITY_ORDER: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
}
