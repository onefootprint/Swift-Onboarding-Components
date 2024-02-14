'use client';

import React from 'react';

import StyledComponentsRegistry from './components/styled-registry';

const ClientProviders = ({ children }: React.PropsWithChildren) => (
  <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
);

export default ClientProviders;
