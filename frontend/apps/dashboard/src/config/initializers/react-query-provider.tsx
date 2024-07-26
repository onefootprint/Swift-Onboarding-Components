import { isLogoutError } from '@onefootprint/request';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import useSession from 'src/hooks/use-session';

type ReactQueryProviderProps = {
  children: React.ReactNode;
};

const queryCache = new QueryCache();

const ReactQueryProvider = ({ children }: ReactQueryProviderProps) => {
  const { logOut } = useSession();

  const handleError = (error: unknown) => {
    if (isLogoutError(error)) {
      logOut();
    }
  };

  const queryClient = new QueryClient({
    queryCache,
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        onError: handleError,
      },
      mutations: {
        onError: handleError,
      },
    },
  });

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

export default ReactQueryProvider;
