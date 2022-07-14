import httpServiceWrapper from 'http-service'
import { authService } from '@oneblink/apps'

const handler: ProxyHandler<Function> = {
  apply: function (target, thisArg, args) {
    if (!args[0].jwt) {
      return authService
        .getIdToken()
        .then((jwt) =>
          Reflect.apply(target, thisArg, [{ ...(args[0] || {}), jwt }]),
        )
    }

    return Reflect.apply(target, thisArg, args)
  },
}

const _h = httpServiceWrapper(window.fetch)

const httpService = Object.entries(_h).reduce((memo, [key, fn]) => {
  //@ts-ignore
  memo[key] = new Proxy(fn, handler)
  return memo
}, {} as typeof _h)

export default httpService
