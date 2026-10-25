import { QueryClient } from '@tanstack/react-query'

import { normalizeApiError } from '@/lib/errors'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        const status = normalizeApiError(error).status
        const retryable = status === null || status >= 500
        return retryable && failureCount < 1
      },
    },
    mutations: {
      retry: false,
    },
  },
})
