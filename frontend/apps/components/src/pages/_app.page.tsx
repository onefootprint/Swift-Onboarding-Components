import '@onefootprint/design-tokens/src/output/theme.css';

import themes from '@onefootprint/design-tokens';
import { ObserveCollectorProvider } from '@onefootprint/dev-tools';
import { DesignSystemProvider } from '@onefootprint/ui';
import { QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import Script from 'next/script';
import React from 'react';

import { GOOGLE_MAPS_KEY } from '../config/constants';
import queryClient from '../config/initializers/react-query';
import configureSentry from '../config/initializers/sentry';

configureSentry();

// TODO: add error boundary
// https://linear.app/footprint/issue/FP-4515/add-nice-error-boundaryfallback-to-embedded-components
const App = ({ Component, pageProps }: AppProps) => (
  <>
    <QueryClientProvider client={queryClient}>
      <ObserveCollectorProvider appName="components">
        <DesignSystemProvider theme={themes.light}>
          <Component {...pageProps} />
        </DesignSystemProvider>
      </ObserveCollectorProvider>
    </QueryClientProvider>
    <Script
      src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places&callback=Function.prototype`}
      strategy="lazyOnload"
    />
  </>
);

export default App;
