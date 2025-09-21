import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import LoginPage from '../features/auth/LoginPage'
import RequireAuth from '../features/auth/RequireAuth'
import AppShell from '../components/AppShell'
import NotFound from '../pages/NotFound'
import TasksPage from '@/features/tasks/TasksPage'
import RouteErrorBoundary from '../components/RouteErrorBoundary'

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: '/',
        element: <TasksPage />,
        errorElement: <RouteErrorBoundary />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
    errorElement: <RouteErrorBoundary />,
  },
])

export const AppRouter = () => {
  return <RouterProvider router={router} />
}
