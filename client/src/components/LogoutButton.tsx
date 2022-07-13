import { useCallback, ReactNode } from 'react'
import { authService } from '@oneblink/apps'

export function LogoutButton(children?: ReactNode) {
  const logOut = useCallback(async () => {
    authService.logoutHostedUI()
    await authService.logout()
  }, [])

  return <button onClick={logOut}>{children || 'Log Out'}</button>
}
