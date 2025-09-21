import { useState } from 'react'
import { ClipboardList } from 'lucide-react'
import { useTasksStore } from '@/stores/tasksStore'
import useTasks from '../hooks/useTasks'
import useUpdateTaskStatus from '../hooks/useUpdateTaskStatus'
import useDeleteTask from '../hooks/useDeleteTask'
import TaskCard from './TaskCard'
import TaskDialog from './TaskDialog'
import type { Task } from '@/types/api'

function TaskList() {
  // Edit dialog state
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // Get filter state from store
  const debouncedSearch = useTasksStore((state) => state.debouncedSearch)
  const statusFilter = useTasksStore((state) => state.statusFilter)
  const dateFilter = useTasksStore((state) => state.dateFilter)
  const hasActiveFilters = useTasksStore(
    (state) =>
      state.searchInput !== '' ||
      state.statusFilter !== 'all' ||
      state.dateFilter !== 'all'
  )

  // Fetch tasks with current filters
  const { tasks, isLoading, error } = useTasks({
    search: debouncedSearch,
    status: statusFilter,
    dateFilter: dateFilter,
  })

  // Hook for updating task status
  const updateTaskStatusMutation = useUpdateTaskStatus()

  // Hook for deleting tasks
  const deleteTaskMutation = useDeleteTask()

  // Handle task actions locally
  const handleToggleComplete = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    const newStatus = task.status === 'open' ? 'closed' : 'open'

    updateTaskStatusMutation.mutate({
      taskId,
      status: newStatus,
    })
  }

  const handleUpdate = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (task) {
      setEditingTask(task)
    }
  }

  const handleDelete = (taskId: string) => {
    deleteTaskMutation.mutate(taskId)
  }

  if (error) {
    return (
      <div className="flex flex-col">
        <div className="flex-1 items-center justify-center">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 max-w-md mx-auto">
            <h3 className="text-sm font-medium text-red-800 mb-2">
              Error loading tasks
            </h3>
            <p className="text-sm text-red-700">
              There was a problem loading your tasks. Please try again.
            </p>
          </div>
        </div>
      </div>
    )
  }
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="bg-card rounded-xl border p-6 animate-pulse"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="h-4 w-4 bg-muted rounded mt-1"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded mb-2 w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                  </div>
                  <div className="h-8 w-8 bg-muted rounded"></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-3 bg-muted rounded w-24"></div>
                  <div className="h-6 bg-muted rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="flex-1 flex flex-col mt-10">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium text-foreground">
              No tasks found
            </h3>

            <p className="mt-2 text-muted-foreground">
              {hasActiveFilters
                ? 'Oops, no tasks found with the current filters.'
                : 'Get started by adding a new task!'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggleComplete={handleToggleComplete}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      ))}

      <TaskDialog
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        mode="edit"
        task={editingTask || undefined}
      />
    </div>
  )
}

export default TaskList
