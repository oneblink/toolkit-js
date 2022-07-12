import { useCallback, ReactNode } from 'react'
import { authService } from '@oneblink/apps'

export function LoginButton(cognitoClientID: string, children?: ReactNode) {
  const logIn = useCallback(async () => {
    await authService?.loginHostedUI(cognitoClientID)
  }, [])

  return <button onClick={logIn}>{children || 'Log In'}</button>
}
