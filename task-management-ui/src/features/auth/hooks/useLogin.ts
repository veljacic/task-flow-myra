import SessionService from '../services/sessionService'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import apiClient from '@/api/apiClient'

function useLogin() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      apiClient.doLogin(data.email, data.password),
    onSuccess: (data) => {
      console.log('Login successful:', data)
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
      console.error('Login failed:', error)
    },
  })
}

export default useLogin
