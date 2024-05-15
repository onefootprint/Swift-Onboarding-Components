import { Grid, Stack } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import React from 'react';
import { MAIN_PAGE_ID } from 'src/config/constants';
import styled, { css } from 'styled-components';

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
    <Content>
      <SideNav />
      <Main id={MAIN_PAGE_ID}>
        <Inner>{children}</Inner>
      </Main>
    </Content>
  </DefaultLayoutContainer>
);

const DefaultLayoutContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const Content = styled(Grid.Container)`
  grid-template-columns: var(--side-nav-width) 1fr;
  height: 100%;
  overflow: hidden;
  position: relative;
`;

const Main = styled.main`
  display: flex;
  flex-direction: column;
  overflow: auto;
  align-items: start;
  flex-grow: 1;
  min-height: 100%;
`;

const Inner = styled.div`
  ${({ theme }) => css`
    max-width: var(--main-content-max-width);
    width: 100%;
    padding: ${theme.spacing[8]};
    margin: 0 auto;
  `}
`;

export default DefaultLayout;
