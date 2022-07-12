import { authService } from '@oneblink/apps'
import { useCallback } from 'react'

export function useLogout() {
  return useCallback(async () => {
    authService.logoutHostedUI()
    await authService.logout()
  }, [])
}
