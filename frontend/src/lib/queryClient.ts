import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// QueryClient configuration for caching and refetching optimization
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // Keep cache for 10 minutes
      retry: 2, // Retry 2 times on failure
      refetchOnWindowFocus: false, // Disable refetching on window focus (performance optimization)
      refetchOnReconnect: true, // Refetch on network reconnection
    },
  },
});

export { queryClient, QueryClientProvider };