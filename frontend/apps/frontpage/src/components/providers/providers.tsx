import '@onefootprint/footprint-js/dist/footprint-js.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { SpeedInsights } from '@vercel/speed-insights/next';

import React from 'react';

import configureReactI18next from '../../config/initializers/react-i18next';
import queryClient from '../../config/initializers/react-query';
import CustomDesignSystemProvider from '../custom-design-system-provider';
import MDXProvider from '../mdx-provider';

configureReactI18next();

const Providers = ({ children }: React.PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>
    <CustomDesignSystemProvider>
      <SpeedInsights />
      <MDXProvider>{children}</MDXProvider>
    </CustomDesignSystemProvider>
  </QueryClientProvider>
);

export default Providers;
