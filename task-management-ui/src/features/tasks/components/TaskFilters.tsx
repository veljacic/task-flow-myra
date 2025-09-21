import { Search, RotateCcw, Loader2 } from 'lucide-react'
import { useTasksStore } from '@/stores/tasksStore'
import { useTasksDebouncing } from '../hooks/useTasksDebouncing'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface TaskFiltersProps {
  onAddTask: () => void
}

function TaskFilters({ onAddTask }: TaskFiltersProps) {
  // Handle debouncing since this component owns the search input
  useTasksDebouncing()

  // Get filter state and actions from store
  const searchInput = useTasksStore((state) => state.searchInput)
  const statusFilter = useTasksStore((state) => state.statusFilter)
  const dateFilter = useTasksStore((state) => state.dateFilter)
  const isDebouncing = useTasksStore((state) => state.isDebouncing)
  const setSearchInput = useTasksStore((state) => state.setSearchInput)
  const setStatusFilter = useTasksStore((state) => state.setStatusFilter)
  const setDateFilter = useTasksStore((state) => state.setDateFilter)
  const resetFilters = useTasksStore((state) => state.resetFilters)

  // Check if any filters are active
  const hasActiveFilters =
    searchInput !== '' || statusFilter !== 'all' || dateFilter !== 'all'

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
      <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full sm:w-auto">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Input
            type="text"
            placeholder="Search tasks by title or description..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10 w-full"
          />
          {isDebouncing ? (
            <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
          ) : (
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="All Dates" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              onClick={resetFilters}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          )}
        </div>
      </div>

      <Button
        onClick={onAddTask}
        className="whitespace-nowrap hover:cursor-pointer w-full sm:w-auto"
      >
        + Add Task
      </Button>
    </div>
  )
}

export default TaskFilters
