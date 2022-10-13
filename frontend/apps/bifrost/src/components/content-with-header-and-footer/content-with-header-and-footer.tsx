import { media } from '@onefootprint/ui';
import { FootprintFooter } from 'footprint-elements';
import React from 'react';
import { BIFROST_SCROLLABLE_CONTAINER_ID } from 'src/hooks/use-bifrost-has-scroll/use-bifrost-has-scroll';
import { CONFETTI_CONTAINER_ID } from 'src/hooks/use-confetti-state';
import styled, { css } from 'styled-components';

import BifrostNavigationHeader from '../bifrost-navigation-header';
import SandboxBanner from '../sandbox-banner';

type ContentWithHeaderAndFooterProps = {
  children: React.ReactNode;
};

const ContentWithHeaderAndFooter = ({
  children,
}: ContentWithHeaderAndFooterProps) => (
  <Container id={BIFROST_SCROLLABLE_CONTAINER_ID}>
    <SandboxBanner />
    <BifrostNavigationHeader />
    <Content id={CONFETTI_CONTAINER_ID}>{children}</Content>
    <FootprintFooter />
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius[2]}px;
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
