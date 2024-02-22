'use client';

import themes from '@onefootprint/design-tokens';
import { DesignSystemProvider } from '@onefootprint/ui';
import React from 'react';

import StyledComponentsRegistry from './components/styled-registry';

const ClientProviders = ({ children }: React.PropsWithChildren) => (
  <StyledComponentsRegistry>
    <DesignSystemProvider theme={themes.light}>{children}</DesignSystemProvider>
  </StyledComponentsRegistry>
);

export default ClientProviders;
