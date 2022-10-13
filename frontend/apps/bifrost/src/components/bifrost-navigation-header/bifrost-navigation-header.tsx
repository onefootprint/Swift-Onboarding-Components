import { media } from '@onefootprint/ui';
import React from 'react';
import useSandboxMode from 'src/hooks/use-sandbox-mode';
import styled, { css } from 'styled-components';

import useBifrostHasScroll from '../../hooks/use-bifrost-has-scroll';

const BifrostNavigationHeader = () => {
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
    padding: 0 ${theme.spacing[5]}px;
    height: 65px; // Height of navigation header in mobile
    position: sticky;
    z-index: ${theme.zIndex.sticky};
    background: ${theme.backgroundColor.primary};
    top: 0;

    ${media.greaterThan('md')`
      padding: 0 ${theme.spacing[4]}px;
      height: 57px; // Height of navigation header in md
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
      border-bottom: 1px solid ${theme.borderColor.primary};
    `}
`;

export default BifrostNavigationHeader;
