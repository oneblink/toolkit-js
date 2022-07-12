import { authService } from '@oneblink/apps'
import { useCallback } from 'react'

export function useLogin(cognitoClientID: string) {
  return useCallback(async () => {
    await authService.loginHostedUI(cognitoClientID)
  }, [])
}
