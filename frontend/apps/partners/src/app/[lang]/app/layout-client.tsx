'use client';

import { Stack } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import { SideNav, TopBar } from './components';

const AppLayoutClient = ({ children }: React.PropsWithChildren) => (
  <Stack direction="column" height="100vh">
    <Stack data-testid="private-default-layout" direction="column" align="center" justify="center">
      <TopBar />
    </Stack>
    <Grid>
      <SideNav />
      <Main>
        <MainContent>{children}</MainContent>
      </Main>
    </Grid>
  </Stack>
);

const Grid = styled.div`
  display: grid;
  grid-template-columns: 240px 1fr;
  height: 100%;
  overflow: hidden;
  position: relative;
`;

const Main = styled.main`
  align-items: start;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-height: 100%;
  overflow: auto;
`;

const MainContent = styled.div`
  ${({ theme }) => css`
    margin: 0 auto;
    max-width: 1600px;
    padding: ${theme.spacing[8]};
    width: 100%;
  `}
`;

export default AppLayoutClient;
