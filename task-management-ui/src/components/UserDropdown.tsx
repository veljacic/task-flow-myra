import { LogOut } from 'lucide-react'
import { useSession } from '@/features/auth/hooks/useSession'
import sessionService from '@/features/auth/services/sessionService'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const UserDropdown = () => {
  const session = useSession()

  const handleLogout = async () => {
    await sessionService.clearSession()
  }

  const getInitials = (email: string) => {
    const [localPart] = email.split('@')
    const words = localPart.split('.')

    if (words.length >= 2) {
      // Take first letter from first 2 words
      return (words[0][0] + words[1][0]).toUpperCase()
    } else {
      // Fallback to first 2 letters
      return localPart.substring(0, 2).toUpperCase()
    }
  }

  if (!session) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2">
          <Avatar className="size-6">
            <AvatarFallback className="text-xs">
              {getInitials(session.email)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm hidden sm:inline">{session.email}</span>
          {/* <ChevronDown className="size-4" /> */}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-red-600 focus:text-red-600"
        >
          <LogOut className="size-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserDropdown
