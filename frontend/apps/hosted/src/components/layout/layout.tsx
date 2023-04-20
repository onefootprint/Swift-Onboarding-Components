import { media } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import Footer from './components/footer';
import SandboxBanner from './components/sandbox-banner';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => (
  <Container>
    <SandboxBanner />
    <Content>{children}</Content>
    <Footer />
  </Container>
);

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  justify-content: space-between;
`;

const Content = styled.div`
  ${({ theme }) => css`
    #layout-container {
      ${media.greaterThan('md')`
        border: 1px solid ${theme.borderColor.tertiary};
        box-shadow: ${theme.elevation[1]};
      `}
    }
  `}
`;

export default Layout;
