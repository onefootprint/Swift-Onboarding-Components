import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { createContext, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import type { UserData } from '../../types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 3,
    },
  },
});

export const Context = createContext<{
  authToken: string | null;
  publicKey: string;
  sandboxId: string;
  userData?: UserData;
}>({
  authToken: null,
  publicKey: '',
  sandboxId: '',
  userData: {},
});

export type ProviderProps = {
  authToken?: string | null;
  children: React.ReactNode;
  publicKey: string;
  sandboxId?: string;
  userData?: UserData;
};

const FootprintProvider = ({ children }: ProviderProps) => {
  const methods = useForm<UserData>();
  const [value] = useState({
    publicKey: '',
    userData: {},
    authToken: null,
    sandboxId: '',
  });

  return (
    <Context.Provider value={value}>
      <QueryClientProvider client={queryClient}>
        <FormProvider {...methods}>
          <div>{children}</div>
        </FormProvider>
      </QueryClientProvider>
    </Context.Provider>
  );
};

export default FootprintProvider;
