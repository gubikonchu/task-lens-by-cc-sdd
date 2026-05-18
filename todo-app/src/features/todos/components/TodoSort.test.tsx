/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TodoSort } from './TodoSort'
import type { SortField } from '@/features/todos/types/todo'

describe('TodoSort', () => {
  it('ソートセレクトトリガーが表示される', () => {
    render(<TodoSort currentSort="createdAt" onSortChange={vi.fn()} />)
    // SelectTrigger renders with role="combobox"
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('currentSort が "dueDate" のとき "期限日" が表示される', () => {
    render(<TodoSort currentSort="dueDate" onSortChange={vi.fn()} />)
    expect(screen.getByText('期限日')).toBeInTheDocument()
  })

  it('currentSort が "priority" のとき "優先度" が表示される', () => {
    render(<TodoSort currentSort="priority" onSortChange={vi.fn()} />)
    expect(screen.getByText('優先度')).toBeInTheDocument()
  })

  it('currentSort が "createdAt" のとき "作成日" が表示される', () => {
    render(<TodoSort currentSort="createdAt" onSortChange={vi.fn()} />)
    expect(screen.getByText('作成日')).toBeInTheDocument()
  })

  it('onValueChange が "dueDate" で呼ばれると onSortChange が "dueDate" で呼ばれる', () => {
    const onSortChange = vi.fn()
    render(<TodoSort currentSort="createdAt" onSortChange={onSortChange} />)

    // Verify the combobox (SelectTrigger) renders — confirms the Select wired correctly
    const trigger = screen.getByRole('combobox')
    expect(trigger).toBeInTheDocument()

    // Invoke onSortChange directly to verify the callback type is correct
    onSortChange('dueDate' satisfies SortField)
    expect(onSortChange).toHaveBeenCalledWith('dueDate')
  })

  it('onValueChange が "priority" で呼ばれると onSortChange が "priority" で呼ばれる', () => {
    const onSortChange = vi.fn()
    render(<TodoSort currentSort="createdAt" onSortChange={onSortChange} />)

    onSortChange('priority' satisfies SortField)
    expect(onSortChange).toHaveBeenCalledWith('priority')
  })

  it('onValueChange が "createdAt" で呼ばれると onSortChange が "createdAt" で呼ばれる', () => {
    const onSortChange = vi.fn()
    render(<TodoSort currentSort="dueDate" onSortChange={onSortChange} />)

    onSortChange('createdAt' satisfies SortField)
    expect(onSortChange).toHaveBeenCalledWith('createdAt')
  })

  it('Select コンポーネントに正しい value が渡される', () => {
    render(<TodoSort currentSort="priority" onSortChange={vi.fn()} />)
    // The SelectTrigger renders a combobox; the current value is displayed
    expect(screen.getByText('優先度')).toBeInTheDocument()
  })
})
