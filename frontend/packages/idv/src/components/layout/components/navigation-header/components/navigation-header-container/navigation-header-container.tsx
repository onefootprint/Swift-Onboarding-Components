import { media } from '@onefootprint/ui';
import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';

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

    const resizeObserver = new ResizeObserver(updateDimensions);

    const startResizeObserve = () => {
      if (layoutContainer) resizeObserver.observe(layoutContainer);
    };

    const stopResizeObserve = () => {
      if (layoutContainer) resizeObserver.unobserve(layoutContainer);
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
      $background={headerBackground}
      $buttonOnly={headerPosition === 'button-only'}
      $hasScroll={hasScroll}
      $isSticky={isSticky}
      $position={position}
      id={NAVIGATION_HEADER_PORTAL_ID}
      style={isSticky ? { top: `${headerTop}px` } : {}}
      width={layoutContainerWidth}
    />
  );
};

const Header = styled.header<{
  $background: NavigationHeaderBGVariant;
  $buttonOnly: boolean;
  $hasScroll: boolean;
  $isSticky: boolean;
  $position: string;
  width: number;
}>`
  ${({ theme, $isSticky, $background, $position, $buttonOnly }) => css`
    padding: 0 ${theme.spacing[5]};
    position: ${$position};
    z-index: ${$isSticky ? theme.zIndex.sticky : 0};

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

      ${$background === 'primary' &&
      css`
        background: ${theme.backgroundColor.primary};
      `}

      ${$background === 'transparent' &&
      css`
        background: ${theme.backgroundColor.transparent};
      `}

      ${$background === 'dark-glass' &&
      css`
        background-color: black;
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        opacity: 0.2;
      `}
      
      ${$background === 'light-glass' &&
      css`
        background: ${theme.backgroundColor.primary};
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        opacity: 0.2;
      `}

      ${$buttonOnly &&
      css`
        background: ${theme.backgroundColor.transparent};
      `}

      ${theme.components.bifrost.container.bg &&
      css`
        background: ${theme.components.bifrost.container.bg};
      `}
    }
  `}

  ${({ $position, width, $buttonOnly }) =>
    $position === 'fixed' &&
    css`
      width: ${$buttonOnly ? 0 : `${width}px`};
    `}

  ${({ theme, $hasScroll, $buttonOnly, $position }) =>
    $hasScroll &&
    !$buttonOnly &&
    $position !== 'relative' &&
    css`
      border-bottom: 1px solid ${theme.borderColor.tertiary};

      &:empty {
        border: none;
      }

      ${theme.components.bifrost.container.bg &&
      css`
        border-bottom: 1px solid ${theme.components.bifrost.container.border};
      `}
    `}
`;

export default NavigationHeaderContainer;
