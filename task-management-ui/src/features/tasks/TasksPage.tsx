import { useState } from 'react'
import StatsCards from './components/StatsCards'
import TaskFilters from './components/TaskFilters'
import TaskList from './components/TaskList'
import TaskDialog from './components/TaskDialog'

function TasksPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleAddTask = () => {
    setIsDialogOpen(true)
  }

  return (
    <div className="h-full flex flex-col gap-6">
      <StatsCards />

      <TaskFilters onAddTask={handleAddTask} />

      <TaskList />

      <TaskDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        mode="create"
      />
    </div>
  )
}

export default TasksPage
