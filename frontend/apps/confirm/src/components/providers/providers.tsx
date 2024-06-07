import themes from '@onefootprint/design-tokens';
import { DesignSystemProvider } from '@onefootprint/ui';
import { QueryClientProvider } from '@tanstack/react-query';
import { DM_Sans, Source_Code_Pro } from 'next/font/google';
import React from 'react';

import configureReactI18next from '../../config/initializers/react-i18next';
import queryClient from '../../config/initializers/react-query';
import configureSentry from '../../config/initializers/sentry';

configureReactI18next();
configureSentry();

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

const Providers = ({ children }: React.PropsWithChildren) => (
  <div className={`${defaultFont.variable} ${codeFont.variable}`}>
    <QueryClientProvider client={queryClient}>
      <DesignSystemProvider theme={themes.light}>{children}</DesignSystemProvider>
    </QueryClientProvider>
  </div>
);

export default Providers;
