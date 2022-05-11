import React from 'react';
import type { DefaultTheme } from 'styled';
import { createGlobalStyle, ThemeProvider } from 'styled';
import { Reset } from 'styled-reset';

import media from '../media';

export type BootstrapProps = {
  children: React.ReactNode;
  theme: DefaultTheme;
};

const GlobalStyle = createGlobalStyle`
  *, :after, :before {
    box-sizing: border-box;
  }

  html {
    font-size: 16px;

    ${media.between('xs', 'sm')`
      font-size: 13px;
    `}
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
