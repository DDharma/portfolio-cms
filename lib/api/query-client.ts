import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Don't refetch on window focus
      refetchOnWindowFocus: false,
      // Retry failed requests once
      retry: 1,
      // Cache time: 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep unused data cached for 10 minutes
      gcTime: 10 * 60 * 1000,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
})
