import { ObserveCollectorProvider } from '@onefootprint/dev-tools';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { DM_Sans, Source_Code_Pro } from 'next/font/google';
import React from 'react';

import configureReactI18next from '../../config/initializers/react-i18next';
import ReactQueryProvider from '../../config/initializers/react-query-provider';
import CustomDesignSystemProvider from '../custom-design-system-provider';
import ErrorBoundary from '../error-boundary';

configureReactI18next();

const defaultFont = DM_Sans({
  display: 'swap',
  preload: true,
  subsets: ['latin'],
  variable: '--font-family-default',
  fallback: ['Inter'],
});

const codeFont = Source_Code_Pro({
  display: 'swap',
  preload: true,
  subsets: ['latin'],
  variable: '--font-family-code',
  fallback: ['Courier New'],
});

const Providers = ({ children }: React.PropsWithChildren) => (
  <div className={`${defaultFont.variable} ${codeFont.variable}`}>
    <ObserveCollectorProvider appName="dashboard">
      <CustomDesignSystemProvider>
        <ReactQueryProvider>
          <ReactQueryDevtools />
          <ErrorBoundary>{children}</ErrorBoundary>
        </ReactQueryProvider>
      </CustomDesignSystemProvider>
    </ObserveCollectorProvider>
  </div>
);

export default Providers;
