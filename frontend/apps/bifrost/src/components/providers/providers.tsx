import { AppearanceProvider } from '@onefootprint/appearance';
import { FootprintProvider, configureFootprint } from '@onefootprint/idv';
import { QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import React, { Fragment } from 'react';

import { Box } from '@onefootprint/ui';

import configureI18n from '../../config/initializers/i18next';
import queryClient from '../../config/initializers/react-query';
import { BifrostMachineProvider } from '../bifrost-machine-provider';

const footprint = configureFootprint();
configureI18n();

const App = ({
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
        <BifrostMachineProvider>
          <FootprintProvider client={footprint}>{children}</FootprintProvider>
        </BifrostMachineProvider>
      </AppearanceProvider>
    </QueryClientProvider>
  );
};

export default App;
