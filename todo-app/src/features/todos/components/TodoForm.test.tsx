/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { TodoForm } from './TodoForm'
import type { Todo } from '@/features/todos/types/todo'

const mockTodo: Todo = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  title: 'テストタスク',
  completed: false,
  priority: 'medium',
  dueDate: '2026-12-31',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

describe('TodoForm', () => {
  describe('addモード', () => {
    it('空タイトルで送信するとエラーメッセージが表示され onSubmit が呼ばれない', async () => {
      const onSubmit = vi.fn()
      render(<TodoForm mode="add" onSubmit={onSubmit} />)

      const submitButton = screen.getByRole('button', { name: /追加|送信|保存/i })
      fireEvent.click(submitButton)

      expect(screen.getByText('タイトルは必須です')).toBeInTheDocument()
      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('有効なタイトルで送信すると onSubmit が呼ばれる', async () => {
      const onSubmit = vi.fn()
      render(<TodoForm mode="add" onSubmit={onSubmit} />)

      const titleInput = screen.getByLabelText(/タイトル/i)
      await userEvent.type(titleInput, 'テスト')

      const submitButton = screen.getByRole('button', { name: /追加|送信|保存/i })
      fireEvent.click(submitButton)

      expect(onSubmit).toHaveBeenCalledTimes(1)
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'テスト' })
      )
    })

    it('送信成功後にフォームがリセットされる', async () => {
      const onSubmit = vi.fn()
      render(<TodoForm mode="add" onSubmit={onSubmit} />)

      const titleInput = screen.getByLabelText(/タイトル/i)
      await userEvent.type(titleInput, 'テスト')

      const submitButton = screen.getByRole('button', { name: /追加|送信|保存/i })
      fireEvent.click(submitButton)

      expect(onSubmit).toHaveBeenCalledTimes(1)
      expect((titleInput as HTMLInputElement).value).toBe('')
    })

    it('期限日を入力して送信すると dueDate が含まれる', async () => {
      const onSubmit = vi.fn()
      render(<TodoForm mode="add" onSubmit={onSubmit} />)

      const titleInput = screen.getByLabelText(/タイトル/i)
      await userEvent.type(titleInput, '期限ありタスク')

      const dueDateInput = screen.getByLabelText(/期限/i)
      fireEvent.change(dueDateInput, { target: { value: '2026-12-31' } })

      const submitButton = screen.getByRole('button', { name: /追加|送信|保存/i })
      fireEvent.click(submitButton)

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ title: '期限ありタスク', dueDate: '2026-12-31' })
      )
    })

    it('期限日フィールドが存在する', () => {
      render(<TodoForm mode="add" onSubmit={vi.fn()} />)
      expect(screen.getByLabelText(/期限/i)).toBeInTheDocument()
    })

    it('優先度セレクトが存在する', () => {
      render(<TodoForm mode="add" onSubmit={vi.fn()} />)
      // SelectTrigger renders with role="combobox"
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('キャンセルボタンが存在しない', () => {
      render(<TodoForm mode="add" onSubmit={vi.fn()} />)
      expect(screen.queryByRole('button', { name: /キャンセル/i })).not.toBeInTheDocument()
    })
  })

  describe('editモード', () => {
    it('initialTodo の値でフィールドが初期化される', () => {
      render(<TodoForm mode="edit" initialTodo={mockTodo} onSubmit={vi.fn()} onCancel={vi.fn()} />)

      const titleInput = screen.getByLabelText(/タイトル/i)
      expect((titleInput as HTMLInputElement).value).toBe('テストタスク')

      const dueDateInput = screen.getByLabelText(/期限/i)
      expect((dueDateInput as HTMLInputElement).value).toBe('2026-12-31')
    })

    it('キャンセルボタン押下で onCancel が呼ばれる', () => {
      const onCancel = vi.fn()
      render(<TodoForm mode="edit" initialTodo={mockTodo} onSubmit={vi.fn()} onCancel={onCancel} />)

      const cancelButton = screen.getByRole('button', { name: /キャンセル/i })
      fireEvent.click(cancelButton)

      expect(onCancel).toHaveBeenCalledTimes(1)
    })

    it('有効な値で送信すると onSubmit が呼ばれる', async () => {
      const onSubmit = vi.fn()
      render(<TodoForm mode="edit" initialTodo={mockTodo} onSubmit={onSubmit} onCancel={vi.fn()} />)

      const submitButton = screen.getByRole('button', { name: /保存|更新|送信/i })
      fireEvent.click(submitButton)

      expect(onSubmit).toHaveBeenCalledTimes(1)
    })

    it('空タイトルで送信するとエラーメッセージが表示され onSubmit が呼ばれない', async () => {
      const onSubmit = vi.fn()
      render(<TodoForm mode="edit" initialTodo={mockTodo} onSubmit={onSubmit} onCancel={vi.fn()} />)

      const titleInput = screen.getByLabelText(/タイトル/i)
      fireEvent.change(titleInput, { target: { value: '' } })

      const submitButton = screen.getByRole('button', { name: /保存|更新|送信/i })
      fireEvent.click(submitButton)

      expect(screen.getByText('タイトルは必須です')).toBeInTheDocument()
      expect(onSubmit).not.toHaveBeenCalled()
    })
  })
})
