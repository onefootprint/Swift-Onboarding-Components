import { ObserveCollectorProvider } from '@onefootprint/dev-tools';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React from 'react';

import configureReactI18next from '../../config/initializers/react-i18next';
import ReactQueryProvider from '../../config/initializers/react-query-provider';
import CustomDesignSystemProvider from '../custom-design-system-provider';
import ErrorBoundary from '../error-boundary';

configureReactI18next();

const Providers = ({ children }: React.PropsWithChildren) => (
  <ObserveCollectorProvider appName="dashboard">
    <CustomDesignSystemProvider>
      <ReactQueryProvider>
        <ReactQueryDevtools />
        <ErrorBoundary>{children}</ErrorBoundary>
      </ReactQueryProvider>
    </CustomDesignSystemProvider>
  </ObserveCollectorProvider>
);

export default Providers;
