import { MutationCache, QueryCache, QueryClient } from '@tanstack/vue-query'
import type { AxiosError } from 'axios'

/**
 * Normalizes an axios failure into the message shape the RN app's `useApi` hook
 * produced: the backend's own `message`, prefixed with the HTTP status when there
 * is one, falling back to the raw error text.
 *
 * `useApi` itself is gone — TanStack Query owns loading/error state now — but this
 * formatting is what every screen's error text expects, so it moves here.
 */
export function toDisplayError(err: unknown): Error {
  const axiosError = err as AxiosError<{ message?: string }>
  const serverMessage = axiosError.response?.data?.message
  const status = axiosError.response?.status

  const message = serverMessage
    ? (status ? `${status}: ${serverMessage}` : serverMessage)
    : (err instanceof Error ? err.message : String(err))

  return new Error(message)
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // `lib/api.ts` already replays a request once after a silent token refresh,
      // so an extra layer of retries here would multiply that.
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },

  queryCache: new QueryCache({
    onError: (error, query) => {
      console.error(`[query.${String(query.queryKey[0])}]`, toDisplayError(error).message)
    },
  }),

  mutationCache: new MutationCache({
    onError: (error) => {
      console.error('[mutation]', toDisplayError(error).message)
    },
  }),
})
