import '@onefootprint/footprint-js/dist/footprint-js.css';

import themes from '@onefootprint/design-tokens';
import { DesignSystemProvider } from '@onefootprint/ui';
import { DM_Sans, Source_Code_Pro } from 'next/font/google';
import React from 'react';

import configureReactI18next from '../../config/initializers/react-i18next';

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

const Providers = ({ children }: React.PropsWithChildren) => (
  <div className={`${defaultFont.variable} ${codeFont.variable}`}>
    <DesignSystemProvider theme={themes.light}>{children}</DesignSystemProvider>
  </div>
);

export default Providers;
