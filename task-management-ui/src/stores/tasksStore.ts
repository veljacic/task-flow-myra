import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface TasksStore {
  // Filter state
  searchInput: string
  debouncedSearch: string
  statusFilter: string
  dateFilter: string
  isDebouncing: boolean

  // Actions
  setSearchInput: (value: string) => void
  setStatusFilter: (value: string) => void
  setDateFilter: (value: string) => void
  setDebouncedSearch: (value: string) => void
  setIsDebouncing: (value: boolean) => void
  resetFilters: () => void
}

export const useTasksStore = create<TasksStore>()(
  devtools(
    (set) => ({
      // Initial state
      searchInput: '',
      debouncedSearch: '',
      statusFilter: 'all',
      dateFilter: 'all',
      isDebouncing: false,

      // Actions
      setSearchInput: (value) => set({ searchInput: value }, false, 'setSearchInput'),
      setStatusFilter: (value) => set({ statusFilter: value }, false, 'setStatusFilter'),
      setDateFilter: (value) => set({ dateFilter: value }, false, 'setDateFilter'),
      setDebouncedSearch: (value) => set({ debouncedSearch: value }, false, 'setDebouncedSearch'),
      setIsDebouncing: (value) => set({ isDebouncing: value }, false, 'setIsDebouncing'),
      resetFilters: () => set({
        searchInput: '',
        debouncedSearch: '',
        statusFilter: 'all',
        dateFilter: 'all',
        isDebouncing: false
      }, false, 'resetFilters'),
    }),
    { name: 'tasks-store' }
  )
)