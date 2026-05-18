import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import type { SortField } from '@/features/todos/types/todo'

interface TodoSortProps {
  currentSort: SortField
  onSortChange: (sort: SortField) => void
}

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'dueDate', label: '期限日' },
  { value: 'priority', label: '優先度' },
  { value: 'createdAt', label: '作成日' },
]

export function TodoSort({ currentSort, onSortChange }: TodoSortProps) {
  return (
    <Select
      value={currentSort}
      onValueChange={(value) => onSortChange(value as SortField)}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map(({ value, label }) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
