import { describe, it, expect } from 'vitest'
import { isOverdue, formatDate, compareDates, PRIORITY_ORDER } from './dateHelpers'

describe('isOverdue', () => {
  it('undefined を渡すと false を返す', () => {
    expect(isOverdue(undefined)).toBe(false)
  })

  it('過去の日付を渡すと true を返す', () => {
    expect(isOverdue('2020-01-01')).toBe(true)
  })

  it('未来の日付を渡すと false を返す', () => {
    expect(isOverdue('2099-12-31')).toBe(false)
  })

  it('今日の日付を渡すと false を返す（今日は期限切れではない）', () => {
    const today = new Date()
    const todayStr = today.toISOString().slice(0, 10)
    expect(isOverdue(todayStr)).toBe(false)
  })
})

describe('formatDate', () => {
  it('undefined を渡すと空文字を返す', () => {
    expect(formatDate(undefined)).toBe('')
  })

  it('有効な日付を yyyy/MM/dd 形式で返す', () => {
    expect(formatDate('2026-01-15')).toBe('2026/01/15')
  })

  it('月と日がゼロ埋めされる', () => {
    expect(formatDate('2026-01-05')).toBe('2026/01/05')
  })
})

describe('compareDates', () => {
  it('earlier date comes first (negative result)', () => {
    expect(compareDates('2026-01-01', '2026-12-31')).toBeLessThan(0)
  })

  it('later date comes after (positive result)', () => {
    expect(compareDates('2026-12-31', '2026-01-01')).toBeGreaterThan(0)
  })

  it('same dates return 0', () => {
    expect(compareDates('2026-06-15', '2026-06-15')).toBe(0)
  })

  it('undefined (a) は末尾扱い → positive を返す', () => {
    expect(compareDates(undefined, '2026-01-01')).toBeGreaterThan(0)
  })

  it('undefined (b) は末尾扱い → negative を返す', () => {
    expect(compareDates('2026-01-01', undefined)).toBeLessThan(0)
  })

  it('両方 undefined は 0 を返す', () => {
    expect(compareDates(undefined, undefined)).toBe(0)
  })
})

describe('PRIORITY_ORDER', () => {
  it('high は 0', () => {
    expect(PRIORITY_ORDER['high']).toBe(0)
  })

  it('medium は 1', () => {
    expect(PRIORITY_ORDER['medium']).toBe(1)
  })

  it('low は 2', () => {
    expect(PRIORITY_ORDER['low']).toBe(2)
  })
})
