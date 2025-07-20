import { BaseService } from '@/services/base'
import { useState, useMemo } from 'react'

/**
 * useApi hook returns a proxy of the service class,
 * wrapping all its methods to handle loading, error, and result state.
 */
export function useApi<TService extends BaseService, TResult = unknown>(serviceClass: TService) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [result, setResult] = useState<TResult | null>(null)

  // Create a proxy that wraps each method
  const api = useMemo(() => {
    const handler: ProxyHandler<TService> = {
      get(target, prop, _receiver) {
        console.log(`[useApi.${String(prop)}] processing API...`)
        const orig = target[prop as keyof TService]
        if (typeof orig !== 'function') return orig
        return async (...args: unknown[]): Promise<TResult> => {
          setLoading(true)
          setError(null)
          try {
            const data = await (orig as (...args: unknown[]) => Promise<TResult>).apply(target, args)
            setResult(data)
            setLoading(false)
            return data
          }
          catch (err: unknown) {
            console.error(`[useApi.${String(prop)}] API Error:`, err)
            setError(err instanceof Error ? err : new Error(String(err)))
            setLoading(false)
            return null as unknown as TResult
          }
        }
      },
    }
    return new Proxy(serviceClass, handler)
  }, [serviceClass])

  return { loading, error, result, api }
}
