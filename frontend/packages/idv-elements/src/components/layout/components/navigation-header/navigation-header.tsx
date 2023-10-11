import styled, { css } from '@onefootprint/styled';
import { Box } from '@onefootprint/ui';
import React, { useCallback, useLayoutEffect, useState } from 'react';

import { LAYOUT_CONTAINER_ID } from '../../constants';
import { HEADER_TITLE_DEFAULT_ID } from '../header-title';
import type { HeaderOptions } from '../layout-options-provider';
import { useLayoutOptions } from '../layout-options-provider';
import Portal from '../portal';
import HeaderContent from './components/header-content';
import NavigationBackButton from './components/navigation-back-button';
import NavigationCloseButton from './components/navigation-close-button';
import NavigationHeaderTitle from './components/navigation-header-title';
import { NAVIGATION_HEADER_PORTAL_SELECTOR } from './constants';
import useContainerHasScroll from './hooks/use-container-has-scroll';
import type {
  NavigationHeaderPositionTypes,
  NavigationHeaderProps,
} from './types';

const NavigationHeader = ({
  button,
  style,
  content,
  position,
}: NavigationHeaderProps) => {
  const {
    onClose,
    header: { options, set: updateHeaderOptions },
  } = useLayoutOptions();
  const isStatic = content?.kind === 'static';
  const staticTitle = isStatic ? content?.title : undefined;
  const [dynamicTitle, setDynamicTitle] = useState<string | undefined>();
  const hasScroll = useContainerHasScroll(LAYOUT_CONTAINER_ID);

  const { position: headerPosition } = options;

  const backgroundVariant = style?.backgroundVariant;
  const titleFontVariant = style?.fontVariant;
  const titleFontColor = style?.fontColor;

  useLayoutEffect(() => {
    const newHeaderOptions: Partial<HeaderOptions> = {};
    newHeaderOptions.position = position || 'sticky';
    newHeaderOptions.background = backgroundVariant || 'primary';
    updateHeaderOptions(newHeaderOptions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backgroundVariant, position]);

  const headerSticky =
    headerPosition === 'sticky' || headerPosition === 'floating';
  const measuredRef = useCallback(
    (handler: HTMLDivElement) => {
      if (!handler || isStatic) {
        return;
      }
      const { height } = handler.getBoundingClientRect();
      if (!height) {
        return;
      }
      observeIntersection();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [headerSticky],
  );

  const observeIntersection = () => {
    if (isStatic) {
      return;
    }
    const {
      containerId = LAYOUT_CONTAINER_ID,
      headerTitleId = HEADER_TITLE_DEFAULT_ID,
    } = content || {};

    // Includes nav header and potentially sandbox banner
    const headerSelector = NAVIGATION_HEADER_PORTAL_SELECTOR;
    const header = document.querySelector(headerSelector);
    const headerTitleSelector = `#${headerTitleId}`;
    const headerTitle = document.querySelector(headerTitleSelector);
    const containerSelector = `#${containerId}`;
    const container = document.querySelector(containerSelector);
    if (!header || !headerTitle || !container) {
      return;
    }
    const containerRect = container.getBoundingClientRect();
    const headerContentRect = header.getBoundingClientRect();
    const rootMargin = headerContentRect.bottom - containerRect.top;
    if (!rootMargin) {
      return;
    }

    const intersectionObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setDynamicTitle(undefined);
          } else {
            const elem = document.querySelector(
              headerTitleSelector,
            ) as HTMLElement;
            if (elem && headerSticky) {
              setDynamicTitle(elem.innerText);
            }
          }
        });
      },
      {
        // Observe the intersection of header title w.r.t layout body container
        root: container,
        // If at least half of the title text is hidden, show it in the nav header
        threshold: 0.5,
        // Deduce the root margin based on where the nav header container ends
        rootMargin: `-${rootMargin}px 0px 0px 0px`,
      },
    );
    intersectionObserver.observe(headerTitle);
  };

  const shouldShowClose = button?.variant === 'close' && !!onClose;
  const shouldShowBack = button?.variant === 'back' && !shouldShowClose;

  if (!shouldShowBack && !shouldShowClose)
    return <Box sx={{ paddingTop: 7 }} />;

  return (
    <Portal selector={NAVIGATION_HEADER_PORTAL_SELECTOR}>
      <HeaderContent ref={isStatic ? null : measuredRef}>
        <ButtonContainer position={position} data-scrolling={hasScroll}>
          {shouldShowClose && (
            <NavigationCloseButton
              confirmClose={button.confirmClose}
              onClose={onClose}
              color={button.color}
            />
          )}
          {shouldShowBack && (
            <NavigationBackButton onBack={button.onBack} color={button.color} />
          )}
        </ButtonContainer>
        <NavigationHeaderTitle
          title={isStatic ? staticTitle : dynamicTitle}
          fontVariant={titleFontVariant}
          fontColor={titleFontColor}
        />
      </HeaderContent>
    </Portal>
  );
};

const ButtonContainer = styled.div<{
  position?: NavigationHeaderPositionTypes;
}>`
  ${({ theme }) => css`
    position: absolute;
    top: ${theme.spacing[5]};
    left: 0;
    isolation: isolate;
    z-index: 1;
  `}

  ${({ position, theme }) =>
    position === 'button-only' &&
    css`
      background-color: ${theme.backgroundColor.primary};
      border-radius: ${theme.borderRadius.full};

      &[data-scrolling='true'] {
        box-shadow: ${theme.elevation[3]};
      }
    `}
`;

export default NavigationHeader;
