import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import React from 'react';
import { isFootprintError } from 'request';
import useSessionUser from 'src/hooks/use-session-user';
import { useToast } from 'ui/src/components/toast/toast-provider';

type My1FPQueryClientProviderProps = {
  children: React.ReactNode;
};

const My1FPQueryClientProvider = ({
  children,
}: My1FPQueryClientProviderProps) => {
  const { show } = useToast();
  const { logOut } = useSessionUser();
  const router = useRouter();

  // Provide some default onError handlers to show a toast when an API error occurs.
  // These can be overridden in the specific useMutation or useQuery arguments
  const handleError = (error: unknown) => {
    // @ts-ignore
    if (isFootprintError(error) && error.response) {
      // @ts-ignore
      if (error.response.status === 401) {
        // If we receive an HTTP 401, assume the auth token has expired and we should prompt to re-log in
        // TODO one day, check that this is a 401 from an expired token
        show(
          {
            description: `To keep your session secure, your login has expired. Please log back in.`,
            title: 'Logged out',
            variant: 'error',
          },
          15_000,
        );
        logOut();
        router.push('/login');
      } else {
        show({
          description: `There was an error making your request: ${
            error.response.statusText || error.message
          }`,
          title: 'Uh-oh!',
          variant: 'error',
        });
      }
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

export default My1FPQueryClientProvider;
