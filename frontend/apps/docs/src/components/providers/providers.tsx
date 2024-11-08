import '@onefootprint/ui/styles.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type React from 'react';
import configureReactI18next from '../../config/initializers/react-i18next';
import queryClient from '../../config/initializers/react-query';
import CustomDesignSystemProvider from '../custom-design-system-provider';

configureReactI18next();

const Providers = ({ children }: React.PropsWithChildren) => (
  <CustomDesignSystemProvider>
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools />
      {children}
    </QueryClientProvider>
  </CustomDesignSystemProvider>
);

export default Providers;
