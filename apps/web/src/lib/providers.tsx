'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useRef } from 'react';
import { makeQueryClient } from './query-client';

export function Providers({ children }: { children: React.ReactNode }) {
  const clientRef = useRef<ReturnType<typeof makeQueryClient> | null>(null);

  if (clientRef.current === null) {
    clientRef.current = makeQueryClient();
  }

  return (
    <QueryClientProvider client={clientRef.current}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
