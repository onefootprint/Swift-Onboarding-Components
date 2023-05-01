import { Layout as AppLayout } from '@onefootprint/idv-elements';
import { media } from '@onefootprint/ui';
import React from 'react';
import useHostedMachine from 'src/hooks/use-hosted-machine';
import styled, { css } from 'styled-components';

import Footer from './components/footer';
import SandboxBanner from './components/sandbox-banner';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const [state] = useHostedMachine();
  const { onboardingConfig } = state.context;

  return (
    <Container>
      <SandboxBanner />
      <Content>
        <AppLayout
          tenantPk={onboardingConfig?.key}
          options={{
            hideDesktopSandboxBanner: true,
            hideDesktopFooter: true,
            hasDesktopBorderRadius: true,
          }}
        >
          {children}
        </AppLayout>
      </Content>
      <Footer />
    </Container>
  );
};

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
