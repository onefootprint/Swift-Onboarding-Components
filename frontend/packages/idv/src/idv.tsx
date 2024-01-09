import type { L10n } from '@onefootprint/footprint-js';
import { createGlobalStyle } from '@onefootprint/styled';
import Script from 'next/script';
import React from 'react';
import { I18nextProvider } from 'react-i18next';

import { L10nContextProvider } from './components/l10n-provider';
import { MachineProvider } from './components/machine-provider';
import { GOOGLE_MAPS_KEY } from './config/constants';
import configureI18next from './config/initializers/i18next';
import Router from './pages/router';
import type { IdvProps } from './types';

type AppProps = IdvProps & { l10n?: L10n };

const App = ({ l10n, ...props }: AppProps) => (
  <>
    <I18nextProvider i18n={configureI18next()}>
      <L10nContextProvider l10n={l10n}>
        <MachineProvider args={props}>
          <GlobalStyle />
          <Router l10n={l10n} />
        </MachineProvider>
      </L10nContextProvider>
    </I18nextProvider>
    <Script
      src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places&callback=Function.prototype`}
      strategy="lazyOnload"
    />
  </>
);

const GlobalStyle = createGlobalStyle`
  html {
    --navigation-header-height: 56px;
    --loading-container-min-height: 188px;
  }

  body {
    background: transparent;
  }
`;

export default App;
