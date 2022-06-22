import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { isFootprintError } from 'request';
import { useToast } from 'ui/src/components/toast/toast-provider';

type DashboardQueryClientProviderProps = {
  children: React.ReactNode;
};

const DashboardQueryClientProvider = ({
  children,
}: DashboardQueryClientProviderProps) => {
  const { open } = useToast();

  // Provide some default onError handlers to show a toast when an API error occurs.
  // These can be overridden in the specific useMutation or useQuery arguments
  const showToast = (error: unknown) => {
    if (isFootprintError(error) && error.response) {
      open({
        description: `HTTP ${error.response.statusText}: ${error.response.data.error.message}`,
        title: 'Error making request',
        variant: 'error',
      });
    }
  };

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        onError: showToast,
      },
      mutations: {
        onError: showToast,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default DashboardQueryClientProvider;
