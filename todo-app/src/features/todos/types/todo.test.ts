import { describe, it, expect } from 'vitest'
import {
  PrioritySchema,
  TodoSchema,
  CreateTodoInputSchema,
  UpdateTodoInputSchema,
} from './todo'

describe('PrioritySchema', () => {
  it('should parse valid priority values', () => {
    expect(PrioritySchema.parse('high')).toBe('high')
    expect(PrioritySchema.parse('medium')).toBe('medium')
    expect(PrioritySchema.parse('low')).toBe('low')
  })

  it('should return "low" as default when value is undefined', () => {
    expect(PrioritySchema.default('low').parse(undefined)).toBe('low')
  })

  it('should reject invalid priority values', () => {
    expect(() => PrioritySchema.parse('urgent')).toThrow()
  })
})

describe('TodoSchema', () => {
  const validTodo = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'テストタスク',
    completed: false,
    priority: 'medium' as const,
    createdAt: '2026-05-19T00:00:00.000Z',
    updatedAt: '2026-05-19T00:00:00.000Z',
  }

  it('should parse a valid todo', () => {
    const result = TodoSchema.parse(validTodo)
    expect(result.title).toBe('テストタスク')
    expect(result.completed).toBe(false)
    expect(result.priority).toBe('medium')
  })

  it('should apply default priority of "low" when priority is omitted', () => {
    const todoWithoutPriority = { ...validTodo }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (todoWithoutPriority as any).priority
    const result = TodoSchema.parse(todoWithoutPriority)
    expect(result.priority).toBe('low')
  })

  it('should accept optional dueDate', () => {
    const todoWithDueDate = { ...validTodo, dueDate: '2026-06-01' }
    const result = TodoSchema.parse(todoWithDueDate)
    expect(result.dueDate).toBe('2026-06-01')
  })

  it('should reject todo without title', () => {
    expect(() => TodoSchema.parse({ ...validTodo, title: '' })).toThrow()
  })
})

describe('CreateTodoInputSchema', () => {
  it('should parse valid create input with title only', () => {
    const result = CreateTodoInputSchema.parse({ title: '新しいタスク' })
    expect(result.title).toBe('新しいタスク')
  })

  it('should reject empty title', () => {
    expect(() => CreateTodoInputSchema.parse({ title: '' })).toThrow()
  })

  it('should accept priority and dueDate', () => {
    const result = CreateTodoInputSchema.parse({
      title: 'タスク',
      priority: 'high',
      dueDate: '2026-12-31',
    })
    expect(result.priority).toBe('high')
    expect(result.dueDate).toBe('2026-12-31')
  })
})

describe('UpdateTodoInputSchema', () => {
  it('should parse an empty object (all fields optional)', () => {
    // Should not throw — all fields are optional
    expect(() => UpdateTodoInputSchema.parse({})).not.toThrow()
  })

  it('should accept partial fields', () => {
    const result = UpdateTodoInputSchema.parse({ title: '更新タスク' })
    expect(result.title).toBe('更新タスク')
  })
})
