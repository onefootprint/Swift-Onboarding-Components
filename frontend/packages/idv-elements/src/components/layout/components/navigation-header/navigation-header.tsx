import styled, { css } from '@onefootprint/styled';
import { Portal } from '@onefootprint/ui';
import React, { useCallback, useState } from 'react';

import { LAYOUT_CONTAINER_ID, LAYOUT_HEADER_ID } from '../../constants';
import { HEADER_TITLE_DEFAULT_ID } from '../header-title';
import { useLayoutOptions } from '../layout-options-provider';
import HeaderContent from './components/header-content';
import NavigationBackButton from './components/navigation-back-button';
import NavigationCloseButton from './components/navigation-close-button';
import NavigationHeaderTitle from './components/navigation-header-title';
import { NAVIGATION_HEADER_PORTAL_SELECTOR } from './constants';
import type { NavigationHeaderProps } from './types';

const NavigationHeader = ({ button, content }: NavigationHeaderProps) => {
  const { onClose } = useLayoutOptions();
  const isStatic = content?.kind === 'static';
  const staticTitle = isStatic ? content?.title : undefined;
  const [dynamicTitle, setDynamicTitle] = useState<string | undefined>();
  const measuredRef = useCallback((handler: HTMLDivElement) => {
    if (!handler || isStatic) {
      return;
    }
    const { height } = handler.getBoundingClientRect();
    if (!height) {
      return;
    }
    observeIntersection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const observeIntersection = () => {
    if (isStatic) {
      return;
    }
    const {
      containerId = LAYOUT_CONTAINER_ID,
      headerTitleId = HEADER_TITLE_DEFAULT_ID,
    } = content || {};

    // Includes nav header and potentially sandbox banner
    const headerSelector = `#${LAYOUT_HEADER_ID}`;
    const header = document.querySelector(headerSelector);
    const headerTitleSelector = `#${headerTitleId}`;
    const headerTitle = document.querySelector(headerTitleSelector);
    const containerSelector = `#${containerId}`;
    const container = document.querySelector(containerSelector);
    if (!header || !headerTitle || !container) {
      return;
    }
    const headerContentRect = header.getBoundingClientRect();
    const rootMargin = headerContentRect.height;
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
            if (elem) {
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

  return (
    <Portal selector={NAVIGATION_HEADER_PORTAL_SELECTOR} removeContent>
      <HeaderContent ref={isStatic ? null : measuredRef}>
        <ButtonContainer>
          {shouldShowClose && (
            <NavigationCloseButton
              confirmClose={button?.confirmClose}
              onClose={onClose}
            />
          )}
          {shouldShowBack && <NavigationBackButton onBack={button?.onBack} />}
        </ButtonContainer>
        <NavigationHeaderTitle title={isStatic ? staticTitle : dynamicTitle} />
      </HeaderContent>
    </Portal>
  );
};

const ButtonContainer = styled.div`
  ${({ theme }) => css`
    position: absolute;
    top: ${theme.spacing[5]};
    left: 0;
  `}
`;

export default NavigationHeader;
