import { media } from '@onefootprint/ui';
import React from 'react';
import useSandboxMode from 'src/hooks/use-sandbox-mode';
import styled, { css } from 'styled-components';

import useBifrostHasScroll from '../../hooks/use-bifrost-has-scroll';

const BifrostNavigationHeaderContainer = () => {
  const hasScroll = useBifrostHasScroll();
  const { isSandbox } = useSandboxMode();

  return (
    <Header
      hasScroll={hasScroll}
      isSandbox={isSandbox}
      id="navigation-header-portal"
    />
  );
};

const Header = styled.header<{ isSandbox: boolean; hasScroll: boolean }>`
  ${({ theme }) => css`
    padding: 0 ${theme.spacing[5]};
    height: var(--navigation-header-height);
    position: sticky;
    z-index: ${theme.zIndex.sticky};
    top: 0;

    ${media.greaterThan('md')`
      padding: 0 ${theme.spacing[4]};
      height: var(--navigation-header-height);
    `}
  `}

  ${({ isSandbox }) =>
    isSandbox &&
    css`
      top: 45px; // Height of sandbox banner
    `}

  ${({ theme, hasScroll }) =>
    hasScroll &&
    css`
      background: ${theme.backgroundColor.primary};
      border-bottom: 1px solid ${theme.borderColor.tertiary};
    `}
`;

export default BifrostNavigationHeaderContainer;
