import SessionService from '@/features/auth/services/sessionService'

type RefreshResponse = {
  access_token: string
  expires_in: number
  user: { email: string }
}

class TokenRefreshService {
  private isRefreshing = false
  private refreshPromise: Promise<void> | null = null

  async executeWithRefresh(
    originalRequest: () => Promise<Response>,
    refreshTokenFn: () => Promise<RefreshResponse>
  ): Promise<Response> {
    // Execute the original request
    const response = await originalRequest()

    // If not a 401, return the response as-is
    if (response.status !== 401) {
      return response
    }

    // Handle 401 - attempt token refresh
    await this.handleTokenRefresh(refreshTokenFn)

    // Retry the original request with new token
    const retryResponse = await originalRequest()

    // If still 401 after refresh, redirect to login
    if (retryResponse.status === 401) {
      await SessionService.clearSession()
    }

    return retryResponse
  }

  private async handleTokenRefresh(refreshTokenFn: () => Promise<RefreshResponse>): Promise<void> {
    if (this.isRefreshing) {
      // Wait for ongoing refresh to complete
      await this.refreshPromise
      return
    }

    // Start refresh process
    this.isRefreshing = true
    this.refreshPromise = this.performRefresh(refreshTokenFn)

    try {
      await this.refreshPromise
    } finally {
      this.isRefreshing = false
      this.refreshPromise = null
    }
  }

  private async performRefresh(refreshTokenFn: () => Promise<RefreshResponse>): Promise<void> {
    try {
      const refreshData = await refreshTokenFn()

      // Update session with new token
      SessionService.setSession({
        token: refreshData.access_token,
        email: refreshData.user.email,
        expiresIn: refreshData.expires_in,
      })
    } catch (error) {
      // Refresh failed - redirect to login
      await SessionService.clearSession()
      throw error
    }
  }
}

// Export a singleton instance
export default new TokenRefreshService()