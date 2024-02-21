import type { L10n } from '@onefootprint/footprint-js';
import { createGlobalStyle } from '@onefootprint/styled';
import Script from 'next/script';
import React from 'react';

import { L10nContextProvider } from './components/l10n-provider';
import { MachineProvider } from './components/machine-provider';
import { GOOGLE_MAPS_KEY } from './config/constants';
import Router from './pages/router';
import type { IdvProps } from './types';

type AppProps = IdvProps & { l10n?: L10n };

const App = ({ l10n, ...props }: AppProps) => (
  <>
    <L10nContextProvider l10n={l10n}>
      <MachineProvider args={props}>
        <GlobalStyle />
        <Router l10n={l10n} />
      </MachineProvider>
    </L10nContextProvider>
    <Script
      async
      src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&loading=async&libraries=places&callback=Function.prototype`}
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
