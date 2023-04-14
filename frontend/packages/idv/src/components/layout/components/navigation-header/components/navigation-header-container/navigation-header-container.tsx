import { media } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import { NAVIGATION_HEADER_PORTAL_ID } from '../../constants';
import useContainerHasScroll from '../../hooks/use-container-has-scroll';

type NavigationHeaderContainerProps = {
  top?: number;
  containerId: string;
};

const NavigationHeaderContainer = ({
  top,
  containerId,
}: NavigationHeaderContainerProps) => {
  const hasScroll = useContainerHasScroll(containerId);

  return (
    <Header
      style={{ top }}
      hasScroll={hasScroll}
      id={NAVIGATION_HEADER_PORTAL_ID}
    />
  );
};

const Header = styled.header<{ hasScroll: boolean }>`
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

  ${({ theme, hasScroll }) =>
    hasScroll &&
    css`
      background: ${theme.backgroundColor.primary};
      border-bottom: 1px solid ${theme.borderColor.tertiary};

      &:empty {
        border: none;
      }
    `}
`;

export default NavigationHeaderContainer;
