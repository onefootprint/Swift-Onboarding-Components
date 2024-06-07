import { AppearanceProvider } from '@onefootprint/appearance';
import { FootprintProvider, configureFootprint } from '@onefootprint/idv';
import { QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import { DM_Sans, Source_Code_Pro } from 'next/font/google';
import React from 'react';

import configureI18n from '../../config/initializers/i18next';
import queryClient from '../../config/initializers/react-query';
import { BifrostMachineProvider } from '../bifrost-machine-provider';

const footprint = configureFootprint();
configureI18n();

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

const App = ({
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
          <BifrostMachineProvider>
            <FootprintProvider client={footprint}>{children}</FootprintProvider>
          </BifrostMachineProvider>
        </AppearanceProvider>
      </QueryClientProvider>
    </div>
  );
};

export default App;
