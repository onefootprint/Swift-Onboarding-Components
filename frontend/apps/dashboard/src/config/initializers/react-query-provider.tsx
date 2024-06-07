import { isLogoutError } from '@onefootprint/request';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import React from 'react';
import useSession from 'src/hooks/use-session';

type ReactQueryProviderProps = {
  children: React.ReactNode;
};

const queryCache = new QueryCache();

const ReactQueryProvider = ({ children }: ReactQueryProviderProps) => {
  const router = useRouter();
  const { logOut } = useSession();

  const handleError = (error: unknown) => {
    if (isLogoutError(error)) {
      logOut();
      router.push('/login?session_expired=true');
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
