import '@onefootprint/footprint-js/dist/footprint-js.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { DM_Sans, Source_Code_Pro } from 'next/font/google';
import React from 'react';

import configureReactI18next from '../../config/initializers/react-i18next';
import queryClient from '../../config/initializers/react-query';
import CustomDesignSystemProvider from '../custom-design-system-provider';
import MDXProvider from '../mdx-provider';

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
    <QueryClientProvider client={queryClient}>
      <CustomDesignSystemProvider>
        <SpeedInsights />
        <MDXProvider>{children}</MDXProvider>
      </CustomDesignSystemProvider>
    </QueryClientProvider>
  </div>
);

export default Providers;
