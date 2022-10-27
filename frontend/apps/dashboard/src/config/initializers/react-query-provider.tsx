import { isLogoutError } from '@onefootprint/request';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import React from 'react';
import useSessionUser from 'src/hooks/use-session-user';

type ReactQueryProviderProps = {
  children: React.ReactNode;
};

const ReactQueryProvider = ({ children }: ReactQueryProviderProps) => {
  const { logOut } = useSessionUser();
  const router = useRouter();

  const handleError = (error: unknown) => {
    if (isLogoutError(error)) {
      logOut();
      router.push('/login?session_expired=true');
    }
  };

  const queryClient = new QueryClient({
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

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default ReactQueryProvider;
