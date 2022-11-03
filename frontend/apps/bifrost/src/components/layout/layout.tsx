import { media } from '@onefootprint/ui';
import { FootprintFooter } from 'footprint-elements';
import React from 'react';
import styled, { css } from 'styled-components';

import BifrostNavigationHeaderContainer from '../bifrost-navigation-header-container';
import SandboxBanner from '../sandbox-banner';
import BIFROST_CONTAINER_ID from './constants';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => (
  <LayoutContainer id={BIFROST_CONTAINER_ID}>
    <SandboxBanner />
    <BifrostNavigationHeaderContainer />
    <Body>{children}</Body>
    <FootprintFooter />
  </LayoutContainer>
);

const LayoutContainer = styled.div`
  ${({ theme }) => css`
    background: ${theme.components.bifrost.dialog.bg};
    border-radius: ${theme.components.bifrost.dialog.borderRadius};
    display: flex;
    flex-direction: column;
    height: 100vh;
    margin: 0;
    overflow-y: auto;
    position: relative;

    > *:first-child {
      border-top-left-radius: ${theme.components.bifrost.dialog.borderRadius};
      border-top-right-radius: ${theme.components.bifrost.dialog.borderRadius};
    }

    > *:last-child {
      border-bottom-left-radius: ${theme.components.bifrost.dialog
        .borderRadius};
      border-bottom-right-radius: ${theme.components.bifrost.dialog
        .borderRadius};
    }

    ${media.greaterThan('md')`
      height: unset;
      margin: ${theme.spacing[9]} auto ${theme.spacing[9]};
      max-width: 480px;
      max-height: calc(100vh - (2 * ${theme.spacing[9]}));
    `}
  `}
`;

const Body = styled.div`
  ${({ theme }) => css`
    flex: 1 0 auto;
    padding: ${theme.spacing[5]};

    ${media.greaterThan('md')`
      padding: 0 ${theme.spacing[7]} ${theme.spacing[7]};
    `}
  `}
`;

export default Layout;
