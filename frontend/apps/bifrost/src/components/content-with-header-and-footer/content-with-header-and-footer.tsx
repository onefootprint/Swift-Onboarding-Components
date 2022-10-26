import { media } from '@onefootprint/ui';
import { FootprintFooter } from 'footprint-elements';
import React from 'react';
import styled, { css } from 'styled-components';

import BifrostNavigationHeaderContainer from '../bifrost-navigation-header-container';
import SandboxBanner from '../sandbox-banner';
import BIFROST_CONTAINER_ID from './constants';

type ContentWithHeaderAndFooterProps = {
  children: React.ReactNode;
};

const ContentWithHeaderAndFooter = ({
  children,
}: ContentWithHeaderAndFooterProps) => (
  <Container id={BIFROST_CONTAINER_ID}>
    <SandboxBanner />
    <BifrostNavigationHeaderContainer />
    <Content>{children}</Content>
    <FootprintFooter />
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default}px;
    display: flex;
    flex-direction: column;
    height: 100vh;
    margin: 0;
    position: relative;
    overflow-y: auto;

    ${media.greaterThan('md')`
      height: unset;
      margin: ${theme.spacing[9]}px auto ${theme.spacing[9]}px;
      max-width: 480px;
      max-height: calc(100vh - (2 * ${theme.spacing[9]}px));
      
    `}
  `}
`;

const Content = styled.div`
  ${({ theme }) => css`
    flex: 1 0 auto;
    padding: ${theme.spacing[5]}px;

    ${media.greaterThan('md')`
      padding: 0 ${theme.spacing[7]}px ${theme.spacing[7]}px;
    `}
  `}
`;

export default ContentWithHeaderAndFooter;
