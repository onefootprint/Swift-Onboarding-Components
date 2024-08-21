import { Stack } from '@onefootprint/ui';
import type React from 'react';
import { createGlobalStyle, css } from 'styled-components';

const Layout = ({ children }: React.PropsWithChildren) => (
  <>
    <GlobalStyle />
    <Stack
      backgroundColor="secondary"
      direction="column"
      gap={5}
      height="100vh"
      justify="center"
      align="center"
      width="100%"
      paddingLeft={5}
      paddingRight={5}
      overflow="hidden"
    >
      {children}
    </Stack>
  </>
);

const GlobalStyle = createGlobalStyle`
  ${({ theme }) => css`
    body {
      background: ${theme.backgroundColor.secondary};
      overflow: hidden;
    }
  `}
`;

export default Layout;
