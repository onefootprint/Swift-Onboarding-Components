'use client';
import themes from '@onefootprint/design-tokens';
import { DesignSystemProvider } from '@onefootprint/ui';
import { QueryClientProvider } from '@tanstack/react-query';
import type React from 'react';
import configureReactI18next from '../../config/initializers/react-i18next';
import queryClient from '../../config/initializers/react-query';

configureReactI18next();

const Providers = ({ children }: React.PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>
    <DesignSystemProvider theme={themes.light}>{children}</DesignSystemProvider>
  </QueryClientProvider>
);

export default Providers;
