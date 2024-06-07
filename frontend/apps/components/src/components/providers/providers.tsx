import { AppearanceProvider } from '@onefootprint/appearance';
import { QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import { DM_Sans, Source_Code_Pro } from 'next/font/google';
import React from 'react';

import configureReactI18next from '../../config/initializers/react-i18next';
import queryClient from '../../config/initializers/react-query';
import FootprintProvider from '../footprint-provider';
import configureFootprint from '../footprint-provider/adapters';

const footprint = configureFootprint();
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
    <div className={`${defaultFont.variable} ${codeFont.variable}`}>
      <QueryClientProvider client={queryClient}>
        <AppearanceProvider appearance={appearance} theme={theme} rules={rules}>
          <FootprintProvider client={footprint}>{children}</FootprintProvider>
        </AppearanceProvider>
      </QueryClientProvider>
    </div>
  );
};

export default Providers;
