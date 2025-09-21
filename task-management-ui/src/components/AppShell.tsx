import { Outlet } from 'react-router-dom'
import UserDropdown from '@/components/UserDropdown'

const AppShell = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              MYRA Security
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your tasks efficiently
            </p>
          </div>

          <nav className="flex items-center space-x-4">
            <UserDropdown />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 lg:px-20 py-6">
        <Outlet />
      </main>
    </div>
  )
}

export default AppShell
