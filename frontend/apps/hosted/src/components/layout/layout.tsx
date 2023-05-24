import { Layout as AppLayout } from '@onefootprint/idv-elements';
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
      <div>
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
      </div>
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

export default Layout;
