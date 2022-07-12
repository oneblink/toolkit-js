import { useCallback } from 'react'
import { authService } from '@oneblink/apps'

export function LogoutButton(children?: React.ReactNode) {
  const logOut = useCallback(async () => {
    authService.logoutHostedUI()
    await authService.logout()
  }, [])

  return <button onClick={logOut}>{children || 'Log Out'}</button>
}
