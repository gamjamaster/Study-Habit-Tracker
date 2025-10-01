import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a function to get or create QueryClient to avoid SSR issues
function makeQueryClient() {
  return new QueryClient({
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
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export { getQueryClient, QueryClientProvider };