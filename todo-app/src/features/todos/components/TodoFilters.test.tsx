/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TodoFilters } from './TodoFilters'
import type { FilterType } from '@/features/todos/types/todo'

describe('TodoFilters', () => {
  it('4つのフィルタータブが表示される', () => {
    render(<TodoFilters currentFilter="all" onFilterChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: '全て' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '未完了' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '完了済み' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '期限切れ' })).toBeInTheDocument()
  })

  it('currentFilter が "all" のとき "全て" ボタンがアクティブスタイルになる', () => {
    render(<TodoFilters currentFilter="all" onFilterChange={vi.fn()} />)

    const allButton = screen.getByRole('button', { name: '全て' })
    // active filter uses data-active attribute or aria-pressed
    expect(allButton).toHaveAttribute('data-active', 'true')
  })

  it('currentFilter が "active" のとき "未完了" ボタンがアクティブになる', () => {
    render(<TodoFilters currentFilter="active" onFilterChange={vi.fn()} />)

    const activeButton = screen.getByRole('button', { name: '未完了' })
    expect(activeButton).toHaveAttribute('data-active', 'true')
  })

  it('currentFilter が "completed" のとき "完了済み" ボタンがアクティブになる', () => {
    render(<TodoFilters currentFilter="completed" onFilterChange={vi.fn()} />)

    const completedButton = screen.getByRole('button', { name: '完了済み' })
    expect(completedButton).toHaveAttribute('data-active', 'true')
  })

  it('currentFilter が "overdue" のとき "期限切れ" ボタンがアクティブになる', () => {
    render(<TodoFilters currentFilter="overdue" onFilterChange={vi.fn()} />)

    const overdueButton = screen.getByRole('button', { name: '期限切れ' })
    expect(overdueButton).toHaveAttribute('data-active', 'true')
  })

  it('"全て" ボタンをクリックすると onFilterChange が "all" で呼ばれる', () => {
    const onFilterChange = vi.fn()
    render(<TodoFilters currentFilter="active" onFilterChange={onFilterChange} />)

    fireEvent.click(screen.getByRole('button', { name: '全て' }))

    expect(onFilterChange).toHaveBeenCalledTimes(1)
    expect(onFilterChange).toHaveBeenCalledWith('all' satisfies FilterType)
  })

  it('"未完了" ボタンをクリックすると onFilterChange が "active" で呼ばれる', () => {
    const onFilterChange = vi.fn()
    render(<TodoFilters currentFilter="all" onFilterChange={onFilterChange} />)

    fireEvent.click(screen.getByRole('button', { name: '未完了' }))

    expect(onFilterChange).toHaveBeenCalledTimes(1)
    expect(onFilterChange).toHaveBeenCalledWith('active' satisfies FilterType)
  })

  it('"完了済み" ボタンをクリックすると onFilterChange が "completed" で呼ばれる', () => {
    const onFilterChange = vi.fn()
    render(<TodoFilters currentFilter="all" onFilterChange={onFilterChange} />)

    fireEvent.click(screen.getByRole('button', { name: '完了済み' }))

    expect(onFilterChange).toHaveBeenCalledTimes(1)
    expect(onFilterChange).toHaveBeenCalledWith('completed' satisfies FilterType)
  })

  it('"期限切れ" ボタンをクリックすると onFilterChange が "overdue" で呼ばれる', () => {
    const onFilterChange = vi.fn()
    render(<TodoFilters currentFilter="all" onFilterChange={onFilterChange} />)

    fireEvent.click(screen.getByRole('button', { name: '期限切れ' }))

    expect(onFilterChange).toHaveBeenCalledTimes(1)
    expect(onFilterChange).toHaveBeenCalledWith('overdue' satisfies FilterType)
  })

  it('アクティブでないボタンには data-active="false" が設定される', () => {
    render(<TodoFilters currentFilter="all" onFilterChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: '未完了' })).toHaveAttribute('data-active', 'false')
    expect(screen.getByRole('button', { name: '完了済み' })).toHaveAttribute('data-active', 'false')
    expect(screen.getByRole('button', { name: '期限切れ' })).toHaveAttribute('data-active', 'false')
  })
})
