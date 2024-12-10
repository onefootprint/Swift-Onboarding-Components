import type { FootprintVariant } from '@onefootprint/footprint-js';
import { Layout as AppLayout } from '@onefootprint/idv';
import { media } from '@onefootprint/ui';
import type React from 'react';
import useHostedMachine from 'src/hooks/use-hosted-machine';
import styled from 'styled-components';
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

  return (
    <Container>
      <SandboxBanner />
      <Content>
        <AppLayout
          config={onboardingConfig}
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
      <Footer config={onboardingConfig} />
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
