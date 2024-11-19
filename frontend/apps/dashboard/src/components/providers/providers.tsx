import type React from 'react';
import '@onefootprint/ui/styles.css';
import { QueryClientProvider } from '@tanstack/react-query';

import configureReactI18next from '../../config/initializers/react-i18next';
import queryClient from '../../config/initializers/react-query';
import CustomDesignSystemProvider from '../custom-design-system-provider';
import ErrorBoundary from '../error-boundary';

configureReactI18next();

const Providers = ({ children }: React.PropsWithChildren) => (
  <CustomDesignSystemProvider>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>{children}</ErrorBoundary>
    </QueryClientProvider>
  </CustomDesignSystemProvider>
);

export default Providers;
