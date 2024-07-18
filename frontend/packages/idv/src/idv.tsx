import Script from 'next/script';
import type { ComponentProps } from 'react';
import React from 'react';
import { createGlobalStyle } from 'styled-components';

import { L10nContextProvider } from './components/l10n-provider';
import { MachineProvider } from './components/machine-provider';
import { GOOGLE_MAPS_SRC } from './config/constants';
import Router from './pages/router';
import type { IdvProps } from './types';
import { checkIsInIframe } from './utils';
import type { IdvMachineArgs } from './utils/state-machine';

type RouterProps = ComponentProps<typeof Router>;
type AppProps = IdvProps & RouterProps;

const Idv = ({ l10n, onIdentifyDone, isInIframe, ...props }: AppProps) => {
  const newIsInIframe = isInIframe === undefined ? checkIsInIframe() : isInIframe;
  const args: IdvMachineArgs = { ...props, isInIframe: newIsInIframe };
  return (
    <>
      <L10nContextProvider l10n={l10n}>
        <MachineProvider args={args}>
          <GlobalStyle />
          <Router l10n={l10n} onIdentifyDone={onIdentifyDone} />
        </MachineProvider>
      </L10nContextProvider>
      {GOOGLE_MAPS_SRC ? <Script src={GOOGLE_MAPS_SRC} async strategy="lazyOnload" /> : null}
    </>
  );
};

const GlobalStyle = createGlobalStyle`
  html {
    --navigation-header-height: 56px;
    --loading-container-min-height: 188px;
  }

  body {
    background: transparent;
  }
`;

export default Idv;
