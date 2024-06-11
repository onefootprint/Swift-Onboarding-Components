import { AppearanceProvider } from '@onefootprint/appearance';
import { QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';

import React from 'react';

import configureReactI18next from '../../config/initializers/react-i18next';
import queryClient from '../../config/initializers/react-query';
import FootprintProvider from '../footprint-provider';
import configureFootprint from '../footprint-provider/adapters';

const footprint = configureFootprint();
configureReactI18next();

// TODO: add error boundary
// https://linear.app/footprint/issue/FP-4515/add-nice-error-boundaryfallback-to-embedded-components
const Providers = ({
  children,
  pageProps,
}: {
  children: React.ReactNode;
  pageProps: AppProps['pageProps'];
}) => {
  const { appearance, theme, rules } = pageProps;

  return (
    <QueryClientProvider client={queryClient}>
      <AppearanceProvider appearance={appearance} theme={theme} rules={rules}>
        <FootprintProvider client={footprint}>{children}</FootprintProvider>
      </AppearanceProvider>
    </QueryClientProvider>
  );
};

export default Providers;
