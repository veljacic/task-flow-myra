import SessionService from '../services/sessionService'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import apiClient from '@/api/apiClient'
import { toast } from 'sonner'

function useRegister() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      apiClient.doRegister(data.email, data.password),
    onSuccess: (data) => {
      console.log('Registration successful:', data)
      toast.success('Registration successful!')
      toast.success(
        'Usually you would get a confirmation email but as this is a demo, you can proceed to log in.'
      )
      SessionService.setSession({
        token: data.access_token,
        expiresIn: data.expires_in,
        email: data.user.email,
      })

      // Redirect to intended location or home page
      const intendedLocation = sessionStorage.getItem('intendedLocation')
      if (intendedLocation) {
        sessionStorage.removeItem('intendedLocation')
        navigate(intendedLocation)
      } else {
        navigate('/')
      }
    },

    onError: (error) => {
      console.error('Registration failed:', error)
    },
  })
}

export default useRegister
