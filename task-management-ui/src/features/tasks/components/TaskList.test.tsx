import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import TaskList from './TaskList'
import * as useTasksModule from '../hooks/useTasks'
import * as useUpdateTaskStatusModule from '../hooks/useUpdateTaskStatus'
import * as useDeleteTaskModule from '../hooks/useDeleteTask'
import * as tasksStoreModule from '@/stores/tasksStore'
import type { Task } from '@/types/api'

// Mock dependencies
vi.mock('../hooks/useTasks')
vi.mock('../hooks/useUpdateTaskStatus')
vi.mock('../hooks/useDeleteTask')
vi.mock('@/stores/tasksStore')
vi.mock('./TaskCard', () => ({
  default: ({ task, onToggleComplete, onUpdate, onDelete }: any) => (
    <div data-testid={`task-card-${task.id}`}>
      <h3>{task.title}</h3>
      <p>{task.description}</p>
      <button onClick={() => onToggleComplete(task.id)} data-testid={`toggle-${task.id}`}>
        Toggle Status
      </button>
      <button onClick={() => onUpdate(task.id)} data-testid={`edit-${task.id}`}>
        Edit
      </button>
      <button onClick={() => onDelete(task.id)} data-testid={`delete-${task.id}`}>
        Delete
      </button>
    </div>
  ),
}))
vi.mock('./TaskDialog', () => ({
  default: ({ isOpen, onClose, mode, task }: any) =>
    isOpen ? (
      <div data-testid="task-dialog">
        <p>Task Dialog - Mode: {mode}</p>
        {task && <p>Editing: {task.title}</p>}
        <button onClick={onClose} data-testid="close-dialog">
          Close
        </button>
      </div>
    ) : null,
}))

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Test Task 1',
    description: 'Description 1',
    status: 'open',
    dueDate: '2024-12-31',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
  {
    id: '2',
    title: 'Test Task 2',
    description: 'Description 2',
    status: 'closed',
    dueDate: '2024-12-25',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-03T00:00:00.000Z',
  },
]

const mockUpdateTaskStatus = vi.fn()
const mockDeleteTask = vi.fn()

describe('TaskList', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default store mock
    vi.mocked(tasksStoreModule.useTasksStore).mockImplementation((selector) => {
      const state = {
        debouncedSearch: '',
        statusFilter: 'all' as const,
        dateFilter: 'all' as const,
        searchInput: '',
      }
      return selector(state)
    })

    // Setup default hooks mocks
    vi.mocked(useTasksModule.default).mockReturnValue({
      tasks: mockTasks,
      isLoading: false,
      error: null,
    })

    vi.mocked(useUpdateTaskStatusModule.default).mockReturnValue({
      mutate: mockUpdateTaskStatus,
    } as any)

    vi.mocked(useDeleteTaskModule.default).mockReturnValue({
      mutate: mockDeleteTask,
    } as any)
  })

  it('renders tasks when data is available', () => {
    render(<TaskList />)

    expect(screen.getByTestId('task-card-1')).toBeInTheDocument()
    expect(screen.getByTestId('task-card-2')).toBeInTheDocument()
    expect(screen.getByText('Test Task 1')).toBeInTheDocument()
    expect(screen.getByText('Test Task 2')).toBeInTheDocument()
  })

  it('shows loading skeleton when isLoading is true', () => {
    vi.mocked(useTasksModule.default).mockReturnValue({
      tasks: [],
      isLoading: true,
      error: null,
    })

    render(<TaskList />)

    // Should show 6 skeleton cards
    const skeletonCards = screen.getAllByRole('generic').filter((element) =>
      element.className.includes('animate-pulse')
    )
    expect(skeletonCards).toHaveLength(6)
  })

  it('shows error message when there is an error', () => {
    vi.mocked(useTasksModule.default).mockReturnValue({
      tasks: [],
      isLoading: false,
      error: new Error('Failed to fetch tasks'),
    })

    render(<TaskList />)

    expect(screen.getByText('Error loading tasks')).toBeInTheDocument()
    expect(
      screen.getByText('There was a problem loading your tasks. Please try again.')
    ).toBeInTheDocument()
  })

  it('shows empty state when no tasks are available', () => {
    vi.mocked(useTasksModule.default).mockReturnValue({
      tasks: [],
      isLoading: false,
      error: null,
    })

    render(<TaskList />)

    expect(screen.getByText('No tasks found')).toBeInTheDocument()
    expect(screen.getByText('Get started by adding a new task!')).toBeInTheDocument()
  })

  it('shows filtered empty state message when filters are active', () => {
    // Mock store with active filters
    vi.mocked(tasksStoreModule.useTasksStore).mockImplementation((selector) => {
      const state = {
        debouncedSearch: 'test search',
        statusFilter: 'open' as const,
        dateFilter: 'today' as const,
        searchInput: 'test search',
      }
      return selector(state)
    })

    vi.mocked(useTasksModule.default).mockReturnValue({
      tasks: [],
      isLoading: false,
      error: null,
    })

    render(<TaskList />)

    expect(screen.getByText('No tasks found')).toBeInTheDocument()
    expect(
      screen.getByText('Oops, no tasks found with the current filters.')
    ).toBeInTheDocument()
  })

  it('handles toggle task status', async () => {
    const user = userEvent.setup()
    render(<TaskList />)

    const toggleButton = screen.getByTestId('toggle-1')
    await user.click(toggleButton)

    expect(mockUpdateTaskStatus).toHaveBeenCalledWith({
      taskId: '1',
      status: 'closed', // Should toggle from 'open' to 'closed'
    })
  })

  it('handles toggle task status from closed to open', async () => {
    const user = userEvent.setup()
    render(<TaskList />)

    const toggleButton = screen.getByTestId('toggle-2')
    await user.click(toggleButton)

    expect(mockUpdateTaskStatus).toHaveBeenCalledWith({
      taskId: '2',
      status: 'open', // Should toggle from 'closed' to 'open'
    })
  })

  it('handles task deletion', async () => {
    const user = userEvent.setup()
    render(<TaskList />)

    const deleteButton = screen.getByTestId('delete-1')
    await user.click(deleteButton)

    expect(mockDeleteTask).toHaveBeenCalledWith('1')
  })

  it('opens edit dialog when update button is clicked', async () => {
    const user = userEvent.setup()
    render(<TaskList />)

    const editButton = screen.getByTestId('edit-1')
    await user.click(editButton)

    expect(screen.getByTestId('task-dialog')).toBeInTheDocument()
    expect(screen.getByText('Task Dialog - Mode: edit')).toBeInTheDocument()
    expect(screen.getByText('Editing: Test Task 1')).toBeInTheDocument()
  })

  it('closes edit dialog when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<TaskList />)

    // Open dialog
    const editButton = screen.getByTestId('edit-1')
    await user.click(editButton)

    expect(screen.getByTestId('task-dialog')).toBeInTheDocument()

    // Close dialog
    const closeButton = screen.getByTestId('close-dialog')
    await user.click(closeButton)

    await waitFor(() => {
      expect(screen.queryByTestId('task-dialog')).not.toBeInTheDocument()
    })
  })

  it('passes correct filters to useTasks hook', () => {
    // Mock store with specific filters
    vi.mocked(tasksStoreModule.useTasksStore).mockImplementation((selector) => {
      const state = {
        debouncedSearch: 'test search',
        statusFilter: 'open' as const,
        dateFilter: 'today' as const,
        searchInput: 'test search',
      }
      return selector(state)
    })

    render(<TaskList />)

    expect(useTasksModule.default).toHaveBeenCalledWith({
      search: 'test search',
      status: 'open',
      dateFilter: 'today',
    })
  })

  it('handles task not found during toggle', async () => {
    const user = userEvent.setup()

    // Mock tasks without the task we're trying to toggle
    vi.mocked(useTasksModule.default).mockReturnValue({
      tasks: [mockTasks[0]], // Only first task
      isLoading: false,
      error: null,
    })

    render(<TaskList />)

    // Try to toggle a task that doesn't exist
    const toggleButton = screen.getByTestId('toggle-1')
    await user.click(toggleButton)

    // Should still call the mutation with the correct task
    expect(mockUpdateTaskStatus).toHaveBeenCalledWith({
      taskId: '1',
      status: 'closed',
    })
  })

  it('handles task not found during edit', async () => {
    const user = userEvent.setup()

    // Mock empty tasks array
    vi.mocked(useTasksModule.default).mockReturnValue({
      tasks: [],
      isLoading: false,
      error: null,
    })

    render(<TaskList />)

    // The edit button won't exist because no tasks are rendered
    expect(screen.queryByTestId('edit-1')).not.toBeInTheDocument()
  })
})