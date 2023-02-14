import { media, Portal } from '@onefootprint/ui';
import React, { useCallback, useState } from 'react';
import styled, { css } from 'styled-components';

import { HEADER_TITLE_DEFAULT_ID } from '../header-title';
import { LAYOUT_CONTAINER_ID, LAYOUT_HEADER_ID } from '../layout/constants';
import NavigationButtonContainer from './components/navigation-button-container';
import NavigationHeaderTitle from './components/navigation-header-title';
import { NAVIGATION_HEADER_PORTAL_SELECTOR } from './constants';

// For rendering a dynamic title text in the nav header
type NavigationHeaderDynamicContent = {
  kind: 'dynamic';
  headerTitleId?: string; // Otherwise uses the default <HeaderTitle/> Title id
  containerId?: string; // Otherwise uses the default <Layout/> Container id
};

type NavigationHeaderStaticContent = {
  kind: 'static';
  title?: string; // Renders the title text directly in the nav header
};

export type NavigationHeaderProps = {
  button?: {
    variant: 'back' | 'close';
    onClick?: () => void;
    confirmClose?: boolean;
  };
  content?: NavigationHeaderDynamicContent | NavigationHeaderStaticContent; // Defaults to dynamic
};

const NavigationHeader = ({ button, content }: NavigationHeaderProps) => {
  const [dynamicTitle, setDynamicTitle] = useState<string | undefined>();
  const measuredRef = useCallback((handler: HTMLDivElement) => {
    if (!handler) {
      return;
    }
    const { height } = handler.getBoundingClientRect();
    if (!height) {
      return;
    }
    observeIntersection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (content?.kind === 'static') {
    return (
      <Portal selector={NAVIGATION_HEADER_PORTAL_SELECTOR} removeContent>
        <HeaderContent>
          <NavigationButtonContainer button={button} />
          <NavigationHeaderTitle title={content?.title} />
        </HeaderContent>
      </Portal>
    );
  }

  const observeIntersection = () => {
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

  return (
    <Portal selector={NAVIGATION_HEADER_PORTAL_SELECTOR} removeContent>
      <HeaderContent ref={measuredRef}>
        <NavigationButtonContainer button={button} />
        <NavigationHeaderTitle title={dynamicTitle} />
      </HeaderContent>
    </Portal>
  );
};

const HeaderContent = styled.div`
  ${({ theme }) => css`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: ${theme.spacing[5]} 0;
    min-height: ${theme.spacing[10]};

    ${media.greaterThan('md')`
      padding:  ${theme.spacing[4]} 0;
    `}
  `}
`;

export default NavigationHeader;
