import React from 'react';
import { Reset } from 'styled-reset';

import { createGlobalStyle, ThemeProvider } from '../../components/styled';
import type { DefaultTheme } from '../../config/themes/types';

export type BootstrapProps = {
  children: React.ReactNode;
  theme: DefaultTheme;
};

// TODO: Define
// Ticket: https://github.com/onefootprint/frontend-monorepo/issues/25
const GlobalStyle = createGlobalStyle``;

const DesignSystemProvider = ({ children, theme }: BootstrapProps) => (
  <ThemeProvider theme={theme}>
    <>
      <Reset />
      <GlobalStyle />
      {children}
    </>
  </ThemeProvider>
);

export default DesignSystemProvider;
