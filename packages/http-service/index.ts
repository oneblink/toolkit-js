import { OneBlinkAppsError } from '@oneblink/apps'

type FetchFn = (
  resource: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>

function addHeader(
  headers: RequestInit['headers'],
  key: string,
  value: string,
) {
  if (!headers) {
    return new Headers({ [key]: value })
  }

  if (headers instanceof Headers) {
    headers.append(key, value)
    return headers
  }

  if (Array.isArray(headers)) {
    headers.push([key, value])
    return headers
  }

  headers[key] = value
  return headers
}

async function getErrorText(response: Response): Promise<string> {
  if (
    response.headers.get('Content-Type')?.toLowerCase() !== 'application/json'
  ) {
    return await response.text()
  }

  const responseBody = await response.json()

  if (typeof responseBody?.message === 'string') return responseBody.message

  console.log('unable to detect error message. Original message:', responseBody)

  return 'Unknown Error'
}

export default function httpService<FetchType extends FetchFn>(_f: FetchType) {
  async function send(
    resource: RequestInfo | URL,
    init: RequestInit,
    jwt?: string,
  ) {
    if (jwt) {
      init.headers = addHeader(init.headers, 'Authorization', `Bearer ${jwt}`)
    }

    const response = await _f(resource, init)

    if (!response.ok) {
      const e = new OneBlinkAppsError(await getErrorText(response), {
        httpStatusCode: response.status,
        requiresLogin: response.status === 401 || response.status === 403,
      })
    }

    return response
  }

  return {
    async get<TOut = unknown>({
      url,
      query,
      jwt,
      signal,
    }: {
      url: string
      query?: Record<string, string> | URLSearchParams
      jwt?: string
      signal?: AbortSignal
    }): Promise<TOut> {
      if (query && !(query instanceof URLSearchParams)) {
        query = new URLSearchParams(query)
      }

      const response = await send(
        `${url}?${query?.toString()}`,
        {
          method: 'GET',
          signal,
        },
        jwt,
      )

      return (await response.json()) as TOut
    },

    async post<TOut = unknown>({
      url,
      body,
      jwt,
      signal,
    }: {
      url: string
      body: Record<PropertyKey, unknown> | unknown[]
      jwt?: string
      signal?: AbortSignal
    }): Promise<TOut> {
      const response = await send(
        url,
        {
          method: 'POST',
          body: JSON.stringify(body),
          signal,
        },
        jwt,
      )

      return (await response.json()) as TOut
    },

    async put<TOut = unknown>({
      url,
      body,
      jwt,
      signal,
    }: {
      url: string
      body: Record<PropertyKey, unknown>
      jwt?: string
      signal?: AbortSignal
    }) {
      const response = await send(
        url,
        {
          method: 'PUT',
          body: JSON.stringify(body),
          signal,
        },
        jwt,
      )

      return (await response.json()) as TOut
    },

    async delete({
      url,
      query,
      jwt,
      signal,
    }: {
      url: string
      query?: Record<string, string> | URLSearchParams
      jwt?: string
      signal?: AbortSignal
    }) {
      if (query && !(query instanceof URLSearchParams)) {
        query = new URLSearchParams(query)
      }

      await send(
        `${url}?${query?.toString()}`,
        {
          method: 'DELETE',
          signal,
        },
        jwt,
      )
    },
  }
}
