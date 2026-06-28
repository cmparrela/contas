import { QueryClient } from '@tanstack/react-query';

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: (failureCount, error) => {
          const status = (error as { status?: number })?.status;
          if (status === 401 || status === 403 || (status && status >= 400 && status < 500))
            return false;
          return failureCount < 3;
        },
      },
    },
  });
}
