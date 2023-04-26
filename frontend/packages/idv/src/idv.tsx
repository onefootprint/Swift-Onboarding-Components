import { useExtendedAppearance } from '@onefootprint/idv-elements';
import { media } from '@onefootprint/ui';
import Script from 'next/script';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { createGlobalStyle } from 'styled-components';

import Layout from './components/layout';
import { MachineProvider } from './components/machine-provider';
import { GOOGLE_MAPS_KEY } from './config/constants';
import configureI18next from './config/initializers/react-i18next';
import Router from './pages/router';
import { IdvProps } from './types';

const App = ({ data, appearance, layout, callbacks }: IdvProps) => {
  const { tenantPk, userData, authToken } = data;
  useExtendedAppearance(appearance);

  return (
    <>
      <I18nextProvider i18n={configureI18next()}>
        <MachineProvider
          tenantPk={tenantPk}
          userData={userData}
          authToken={authToken}
          onComplete={callbacks?.onComplete}
          onClose={callbacks?.onClose}
        >
          <GlobalStyle />
          <Layout options={layout}>
            <Router />
          </Layout>
        </MachineProvider>
      </I18nextProvider>
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
