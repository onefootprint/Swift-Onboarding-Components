import styled, { css } from '@onefootprint/styled';
import { Stack } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import React from 'react';

import AssumeBanner from './components/assume-banner';
import SandboxBanner from './components/sandbox-banner';
import SideNav from './components/side-nav';
import TopMenuBar from './components/top-menu-bar';

type DefaultLayoutProps = {
  children: React.ReactNode;
};

const DefaultLayout = ({ children }: DefaultLayoutProps) => (
  <DefaultLayoutContainer
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    initial={{ opacity: 0 }}
  >
    <Stack
      data-testid="private-default-layout"
      direction="column"
      align="center"
      justify="center"
    >
      <AssumeBanner />
      <SandboxBanner />
      <TopMenuBar />
    </Stack>
    <Content direction="row">
      <SideNav />
      <Main>{children}</Main>
    </Content>
  </DefaultLayoutContainer>
);

const DefaultLayoutContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const Content = styled(Stack)`
  flex: 1;
  width: 100%;
  max-width: 100%;
  overflow: auto;
`;

const Main = styled.main`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: 100%;
    overflow: auto;
    padding: ${theme.spacing[8]};
  `}
`;

export default DefaultLayout;
