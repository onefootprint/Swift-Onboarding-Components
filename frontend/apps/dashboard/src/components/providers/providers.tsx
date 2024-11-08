import type React from 'react';
import '@onefootprint/ui/styles.css';
import configureReactI18next from '../../config/initializers/react-i18next';
import ReactQueryProvider from '../../config/initializers/react-query-provider';
import CustomDesignSystemProvider from '../custom-design-system-provider';
import ErrorBoundary from '../error-boundary';

configureReactI18next();

const Providers = ({ children }: React.PropsWithChildren) => (
  <CustomDesignSystemProvider>
    <ReactQueryProvider>
      <ErrorBoundary>{children}</ErrorBoundary>
    </ReactQueryProvider>
  </CustomDesignSystemProvider>
);

export default Providers;
