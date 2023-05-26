import { Layout as AppLayout } from '@onefootprint/idv-elements';
import { media } from '@onefootprint/ui';
import React from 'react';
import useHostedMachine from 'src/hooks/use-hosted-machine';
import styled from 'styled-components';

import Footer from './components/footer';
import SandboxBanner from './components/sandbox-banner';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const [state] = useHostedMachine();
  const { onboardingConfig } = state.context;
  const isSandbox = onboardingConfig?.isLive === false;
  const { appearance, key } = onboardingConfig ?? {};

  return (
    <Container>
      <SandboxBanner />
      <Content>
        <AppLayout
          tenantPk={key}
          isSandbox={isSandbox}
          appearance={appearance}
          options={{
            hideDesktopSandboxBanner: true,
            hideDesktopFooter: true,
            hasDesktopBorderRadius: true,
            fixContainerSize: true,
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
