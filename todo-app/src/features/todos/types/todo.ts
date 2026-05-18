import { z } from 'zod'

export const PrioritySchema = z.enum(['high', 'medium', 'low'])
export type Priority = z.infer<typeof PrioritySchema>

export const TodoSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'タイトルは必須です'),
  completed: z.boolean(),
  priority: PrioritySchema.default('low'),
  dueDate: z.string().optional(), // YYYY-MM-DD
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type Todo = z.infer<typeof TodoSchema>

export const CreateTodoInputSchema = TodoSchema.pick({
  title: true,
  dueDate: true,
}).extend({
  priority: PrioritySchema.optional().default('low'),
})
export type CreateTodoInput = z.input<typeof CreateTodoInputSchema>

export const UpdateTodoInputSchema = CreateTodoInputSchema.partial()
export type UpdateTodoInput = z.infer<typeof UpdateTodoInputSchema>

export type FilterType = 'all' | 'active' | 'completed' | 'overdue'
export type SortField = 'dueDate' | 'priority' | 'createdAt'
