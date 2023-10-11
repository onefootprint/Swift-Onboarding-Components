import styled, { css } from '@onefootprint/styled';
import { media } from '@onefootprint/ui';
import React, { useEffect, useState } from 'react';

import { LAYOUT_CONTAINER_ID } from '../../../../constants';
import { useLayoutOptions } from '../../../layout-options-provider';
import { NAVIGATION_HEADER_PORTAL_ID } from '../../constants';
import useContainerHasScroll from '../../hooks/use-container-has-scroll';
import type { NavigationHeaderBGVariant } from '../../types';

type NavigationHeaderContainerProps = {
  top?: number;
  containerId: string;
};

const NavigationHeaderContainer = ({
  top,
  containerId,
}: NavigationHeaderContainerProps) => {
  const hasScroll = useContainerHasScroll(containerId);
  const {
    header: { options },
  } = useLayoutOptions();

  const { position: headerPosition, background: headerBackground } = options;

  const [headerTop, setHeaderTop] = useState(0);
  const [layoutContainerWidth, setLayoutContainerWidth] = useState(0);

  useEffect(() => {
    const layoutContainer = document.querySelector(`#${LAYOUT_CONTAINER_ID}`);

    const updateDimensions = () => {
      const containerTop = layoutContainer?.getBoundingClientRect().top || 0;
      const containerWidth = layoutContainer?.clientWidth || 0;
      setLayoutContainerWidth(containerWidth);
      let newHeaderTop = top ?? 0;
      if (headerPosition === 'floating' || headerPosition === 'button-only')
        newHeaderTop += containerTop;
      setHeaderTop(newHeaderTop);
    };

    const startResizeObserve = () => {
      if (layoutContainer)
        new ResizeObserver(updateDimensions).observe(layoutContainer);
    };

    const stopResizeObserve = () => {
      if (layoutContainer)
        new ResizeObserver(updateDimensions).unobserve(layoutContainer);
    };

    startResizeObserve();

    return stopResizeObserve;
  }, [headerPosition, top]);

  let position = 'sticky';
  if (headerPosition === 'nonSticky') position = 'relative';
  if (headerPosition === 'floating' || headerPosition === 'button-only')
    position = 'fixed';

  const isSticky = headerPosition !== 'nonSticky';

  return (
    <Header
      style={isSticky ? { top: `${headerTop}px` } : {}}
      hasScroll={hasScroll}
      id={NAVIGATION_HEADER_PORTAL_ID}
      isSticky={isSticky}
      background={headerBackground}
      position={position}
      width={layoutContainerWidth}
      buttonOnly={headerPosition === 'button-only'}
    />
  );
};

const Header = styled.header<{
  hasScroll: boolean;
  isSticky: boolean;
  background: NavigationHeaderBGVariant;
  position: string;
  width: number;
  buttonOnly: boolean;
}>`
  ${({ theme, isSticky, background, position, buttonOnly }) => css`
    padding: 0 ${theme.spacing[5]};
    position: ${position};
    z-index: ${isSticky ? theme.zIndex.sticky : 0};

    ${media.greaterThan('md')`
      padding: 0 ${theme.spacing[4]};
    `}

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;

      ${background === 'primary' &&
      css`
        background: ${theme.backgroundColor.primary};
      `}

      ${background === 'transparent' &&
      css`
        background: ${theme.backgroundColor.transparent};
      `}

      ${background === 'dark-glass' &&
      css`
        background-color: black;
        backdrop-filter: blur(12px);
        opacity: 0.2;
      `}

      ${background === 'light-glass' &&
      css`
        background: ${theme.backgroundColor.primary};
        backdrop-filter: blur(10px);
        opacity: 0.2;
      `}

      ${buttonOnly &&
      css`
        background: ${theme.backgroundColor.transparent};
      `}
    }
  `}

  ${({ position, width, buttonOnly }) =>
    position === 'fixed' &&
    css`
      width: ${buttonOnly ? 0 : `${width}px`};
    `}

  ${({ theme, hasScroll, buttonOnly }) =>
    hasScroll &&
    !buttonOnly &&
    css`
      border-bottom: 1px solid ${theme.borderColor.tertiary};

      &:empty {
        border: none;
      }
    `}
`;

export default NavigationHeaderContainer;
