import { PropsWithChildren } from 'react'
import { Route, Redirect, RouteProps } from 'react-router-dom'

import { useAuth } from '@oneblink/apps-react'

function AuthenticatedRoute({
  children,
  ...props
}: PropsWithChildren<RouteProps>) {
  const { isLoggedIn } = useAuth()

  return (
    <Route {...props}>
      {({ location }) => {
        return isLoggedIn ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: location },
            }}
          />
        )
      }}
    </Route>
  )
}

export default AuthenticatedRoute
