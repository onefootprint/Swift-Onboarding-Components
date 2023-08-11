import { FootprintVariant } from '@onefootprint/footprint-js';
import { Layout as AppLayout } from '@onefootprint/idv-elements';
import styled from '@onefootprint/styled';
import { media } from '@onefootprint/ui';
import React from 'react';
import useHostedMachine from 'src/hooks/use-hosted-machine';

import Footer from './components/footer';
import SandboxBanner from './components/sandbox-banner';

type LayoutProps = {
  children: React.ReactNode;
  variant?: FootprintVariant;
};

const Layout = ({ children, variant }: LayoutProps) => {
  const [state] = useHostedMachine();
  const { onboardingConfig } = state.context;
  const isSandbox = onboardingConfig?.isLive === false;
  const { key } = onboardingConfig ?? {};

  return (
    <Container>
      <SandboxBanner />
      <Content>
        <AppLayout
          tenantPk={key}
          variant={variant}
          isSandbox={isSandbox}
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
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1 1;

  ${media.greaterThan('md')`
    --footer-height: 130px;
    height: calc(100% - var(--footer-height));
  `}
`;

export default Layout;
