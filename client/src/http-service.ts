import httpServiceWrapper from 'http-service'
import { authService } from '@oneblink/apps'
import { O, F } from 'ts-toolbelt'

type JWTParam = { jwt?: string | boolean }

type GetFnParams = O.Merge<
  F.Parameters<ReturnType<typeof httpServiceWrapper>['get']>[0],
  JWTParam
>
type PostFnParams = O.Merge<
  F.Parameters<ReturnType<typeof httpServiceWrapper>['post']>[0],
  JWTParam
>
type PutFnParams = O.Merge<
  F.Parameters<ReturnType<typeof httpServiceWrapper>['put']>[0],
  JWTParam
>
type DeleteFnParams = O.Merge<
  F.Parameters<ReturnType<typeof httpServiceWrapper>['delete']>[0],
  JWTParam
>

interface ClientHTTPService {
  get<TOut = unknown>(params: GetFnParams): Promise<TOut>
  post<TOut = unknown>(params: PostFnParams): Promise<TOut>
  put<TOut = unknown>(params: PutFnParams): Promise<TOut>
  delete(params: DeleteFnParams): Promise<void>
}

const jwtHandler: ProxyHandler<ClientHTTPService[keyof ClientHTTPService]> = {
  apply: function (target, thisArg, args) {
    const jwtOption = args[0].jwt

    // if jwt is not supplied use the OneBlink JWT
    if (jwtOption == null || jwtOption === true) {
      return authService
        .getIdToken()
        .then((jwt) =>
          Reflect.apply(target, thisArg, [{ ...(args[0] || {}), jwt }]),
        )
    }

    // if jwt is supplied or set to false, use jwt or no jwt
    const newOptions =
      jwtOption === false
        ? {
            ...args[0],
            jwt: undefined,
          }
        : args[0]

    return Reflect.apply(target, thisArg, [newOptions])
  },
}

// use the browsers fetch fn for http
const _h = httpServiceWrapper(window.fetch)

// add some magic to automatically add the OB JWT to fetch requests unless explicitly told not to
const httpService = Object.entries(_h).reduce((memo, [key, fn]) => {
  //@ts-ignore
  memo[key] = new Proxy(fn, jwtHandler)
  return memo
}, {} as ClientHTTPService)

export default httpService
