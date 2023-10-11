import styled, { css } from '@onefootprint/styled';
import { media } from '@onefootprint/ui';
import React, { useCallback, useEffect, useState } from 'react';

import { LAYOUT_CONTAINER_ID } from '../../constants';
import FootprintFooter from '../footprint-footer';
import { useLayoutOptions } from '../layout-options-provider';
import NavigationHeaderContainer from '../navigation-header/components/navigation-header-container';
import type { SandboxBannerHandler } from '../sandbox-banner';
import SandboxBanner from '../sandbox-banner';
import { BOTTOM_ACTION_BOX_PORTAL_ID } from '../sticky-bottom-box/constants';

export const IDV_BODY_CONTENT_CONTAINER_ID = 'idv-body-content-container';

type ContentProps = {
  children: React.ReactNode;
  tenantPk?: string;
  isSandbox?: boolean;
};

const Content = ({ children, tenantPk, isSandbox }: ContentProps) => {
  const { options, footer } = useLayoutOptions();
  const { hideDesktopSandboxBanner, hideDesktopFooter } = options || {};
  const [sandboxBannerHeight, setSandboxBannerHeight] = useState(0);
  const {
    options: { height: footerHeight },
  } = footer;
  const [bodyContentOverflowing, setBodyContentOverflowing] = useState(false);

  useEffect(() => {
    const body = document.querySelector(`#${IDV_BODY_CONTENT_CONTAINER_ID}`);

    const checkOverflow = () => {
      const layoutContainer = document.getElementById(LAYOUT_CONTAINER_ID);
      if (!layoutContainer) return;
      const isOverflowing =
        layoutContainer.scrollHeight > layoutContainer.clientHeight;
      setBodyContentOverflowing(isOverflowing);
    };

    const startResizeObserve = () => {
      if (body) new ResizeObserver(checkOverflow).observe(body);
    };

    const stopResizeObserve = () => {
      if (body) new ResizeObserver(checkOverflow).unobserve(body);
    };

    startResizeObserve();

    return stopResizeObserve;
  }, []);

  const measuredRef = useCallback((handler: SandboxBannerHandler) => {
    if (!handler) {
      return;
    }
    const height = handler.getHeight();
    if (height) {
      setSandboxBannerHeight(height);
    }
  }, []);

  return (
    <Container>
      {isSandbox && (
        <SandboxBanner
          ref={measuredRef}
          hideOnDesktop={hideDesktopSandboxBanner}
        />
      )}
      <NavigationHeaderContainer
        top={sandboxBannerHeight}
        containerId={LAYOUT_CONTAINER_ID}
      />
      <BodyContainer id={IDV_BODY_CONTENT_CONTAINER_ID}>
        <BodyContent>{children}</BodyContent>
      </BodyContainer>
      <BottomActionContainer
        bottom={footerHeight}
        id={BOTTOM_ACTION_BOX_PORTAL_ID}
        showBorderTop={bodyContentOverflowing}
      />
      <FootprintFooter hideOnDesktop={hideDesktopFooter} tenantPk={tenantPk} />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const BodyContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const BodyContent = styled.span`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    box-sizing: content-box;
    padding: ${theme.spacing[5]};
    height: 100%;
    overflow-y: auto;

    ${media.greaterThan('md')`
      padding: 0 ${theme.spacing[7]} ${theme.spacing[8]}; 
    `}
  `}
`;

const BottomActionContainer = styled.div<{
  bottom: number;
  showBorderTop: boolean;
}>`
  ${({ theme, bottom }) => css`
    display: flex;
    flex-direction: column;
    position: sticky;
    bottom: ${bottom}px;
    z-index: ${theme.zIndex.sticky};
  `}

  ${({ theme, showBorderTop }) =>
    showBorderTop &&
    css`
      border-top: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};

      &:empty {
        border: none;
      }
    `}
`;

export default Content;
