import { useEffect } from 'react'
import { useTasksStore } from '@/stores/tasksStore'

export function useTasksDebouncing(delay: number = 2000) {
  const searchInput = useTasksStore((state) => state.searchInput)
  const debouncedSearch = useTasksStore((state) => state.debouncedSearch)
  const setDebouncedSearch = useTasksStore((state) => state.setDebouncedSearch)
  const setIsDebouncing = useTasksStore((state) => state.setIsDebouncing)

  useEffect(() => {
    // Check if we need to debounce (searchInput differs from debouncedSearch)
    const shouldDebounce = searchInput !== debouncedSearch

    if (shouldDebounce) {
      setIsDebouncing(true)
    }

    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput)
      setIsDebouncing(false)
    }, delay)

    return () => {
      clearTimeout(timer)
      // If cleanup happens and we were debouncing, reset the debouncing state
      if (shouldDebounce) {
        setIsDebouncing(false)
      }
    }
  }, [searchInput, debouncedSearch, setDebouncedSearch, setIsDebouncing, delay])
}
