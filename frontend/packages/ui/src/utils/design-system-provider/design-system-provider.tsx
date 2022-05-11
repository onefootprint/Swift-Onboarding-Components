import React from 'react';
import type { DefaultTheme } from 'styled';
import { createGlobalStyle, ThemeProvider } from 'styled';
import { Reset } from 'styled-reset';

export type BootstrapProps = {
  children: React.ReactNode;
  theme: DefaultTheme;
};

const GlobalStyle = createGlobalStyle`
  *, :after, :before {
    box-sizing: border-box;
  }
`;

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
