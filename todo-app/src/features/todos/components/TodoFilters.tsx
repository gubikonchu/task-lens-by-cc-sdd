import { Button } from '@/shared/components/ui/button'
import type { FilterType } from '@/features/todos/types/todo'

interface TodoFiltersProps {
  currentFilter: FilterType
  onFilterChange: (filter: FilterType) => void
}

const FILTER_TABS: { value: FilterType; label: string }[] = [
  { value: 'all', label: '全て' },
  { value: 'active', label: '未完了' },
  { value: 'completed', label: '完了済み' },
  { value: 'overdue', label: '期限切れ' },
]

export function TodoFilters({ currentFilter, onFilterChange }: TodoFiltersProps) {
  return (
    <div className="flex gap-1 flex-wrap">
      {FILTER_TABS.map(({ value, label }) => {
        const isActive = currentFilter === value
        return (
          <Button
            key={value}
            variant={isActive ? 'default' : 'ghost'}
            size="sm"
            data-active={isActive ? 'true' : 'false'}
            onClick={() => onFilterChange(value)}
          >
            {label}
          </Button>
        )
      })}
    </div>
  )
}
