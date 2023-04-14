import theme from '@onefootprint/design-tokens';
import { DesignSystemProvider, media } from '@onefootprint/ui';
import { QueryClientProvider } from '@tanstack/react-query';
import Script from 'next/script';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { createGlobalStyle } from 'styled-components';

import AppContextProvider from './components/app-context-provider';
import Layout from './components/layout';
import { MachineProvider } from './components/machine-provider';
import { GOOGLE_MAPS_KEY } from './config/contants';
import configureI18next from './config/initializers/react-i18next';
import queryClient from './config/initializers/react-query';
import useExtendedAppearance from './hooks/use-extended-appearance';
import { IdvProps } from './idv.types';
import Router from './pages/router';

const App = ({ data, appearance, layout, callbacks }: IdvProps) => {
  const { tenantPk, bootstrapData } = data;
  useExtendedAppearance(appearance);

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={configureI18next()}>
          <AppContextProvider layout={layout} callbacks={callbacks}>
            <MachineProvider tenantPk={tenantPk} bootstrapData={bootstrapData}>
              <DesignSystemProvider
                theme={
                  appearance?.theme ? theme[appearance.theme] : theme.light
                }
              >
                <GlobalStyle />
                <Layout>
                  <Router />
                </Layout>
              </DesignSystemProvider>
            </MachineProvider>
          </AppContextProvider>
        </I18nextProvider>
      </QueryClientProvider>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places&callback=Function.prototype`}
        strategy="lazyOnload"
      />
    </>
  );
};

const GlobalStyle = createGlobalStyle`
  html {
    --navigation-header-height: 65px;
    --loading-container-min-height: 188px;

    ${media.greaterThan('md')`
      --navigation-header-height: 57px;
    `}
  }

  body {
    background: transparent;
  }
`;

export default App;
