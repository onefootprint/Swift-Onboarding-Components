import styled from '@onefootprint/styled';
import React from 'react';

import FootprintFooter from '../footprint-footer';
import { useLayoutOptions } from '../layout-options-provider';
import Body from './components/body';
import Header from './components/header';

type ContentProps = {
  children: React.ReactNode;
  tenantPk?: string;
  isSandbox?: boolean;
};

const Content = ({ children, tenantPk, isSandbox }: ContentProps) => {
  const { options } = useLayoutOptions();
  const { hideDesktopSandboxBanner, hideDesktopFooter } = options || {};

  return (
    <Container>
      <Header
        isSandbox={isSandbox}
        hideDesktopSandboxBanner={hideDesktopSandboxBanner}
      />
      <Body>{children}</Body>
      <FootprintFooter hideOnDesktop={hideDesktopFooter} tenantPk={tenantPk} />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export default Content;
