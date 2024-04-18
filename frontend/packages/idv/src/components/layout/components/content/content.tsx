import type { PublicOnboardingConfig } from '@onefootprint/types';
import { media, Stack } from '@onefootprint/ui';
import React, { useCallback, useEffect, useState } from 'react';
import styled, { css } from 'styled-components';

import { LAYOUT_CONTAINER_ID } from '../../constants';
import FootprintFooter from '../footprint-footer';
import { useLayoutOptions } from '../layout-options-provider';
import NavigationHeaderContainer from '../navigation-header/components/navigation-header-container';
import type { SandboxBannerHandler } from '../sandbox-banner';
import SandboxBanner from '../sandbox-banner';
import { BOTTOM_ACTION_BOX_PORTAL_ID } from '../sticky-bottom-box/constants';
import WhatsThisBottomSheet from '../whats-this-bottom-sheet';

export const IDV_BODY_CONTENT_CONTAINER_ID = 'idv-body-content-container';

type ContentProps = {
  children: React.ReactNode;
  isSandbox?: boolean;
  config?: PublicOnboardingConfig;
};

const Content = ({ children, isSandbox, config }: ContentProps) => {
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

    const resizeObserver = new ResizeObserver(checkOverflow);

    const startResizeObserve = () => {
      if (body) resizeObserver.observe(body);
    };

    const stopResizeObserve = () => {
      if (body) resizeObserver.unobserve(body);
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

  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <Stack direction="column" height="100%" position="relative">
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
      <Stack
        direction="column"
        position="relative"
        flexGrow={1}
        id={IDV_BODY_CONTENT_CONTAINER_ID}
      >
        <BodyContent>{children}</BodyContent>
      </Stack>
      <BottomActionContainer
        $bottom={footerHeight}
        $showBorderTop={bodyContentOverflowing}
        id={BOTTOM_ACTION_BOX_PORTAL_ID}
      />
      <WhatsThisBottomSheet
        open={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        config={config}
        containerId={LAYOUT_CONTAINER_ID}
      />
      <FootprintFooter
        hideOnDesktop={hideDesktopFooter}
        onWhatsThisClick={() => setIsSheetOpen(true)}
        config={config}
      />
    </Stack>
  );
};

const BodyContent = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    box-sizing: content-box;
    padding: ${theme.spacing[5]};
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;

    ${media.greaterThan('md')`
      padding: 0 ${theme.spacing[7]} ${theme.spacing[7]}; 
    `}
  `}
`;

const BottomActionContainer = styled.div<{
  $bottom: number;
  $showBorderTop: boolean;
}>`
  ${({ theme, $bottom }) => css`
    display: flex;
    flex-direction: column;
    position: sticky;
    bottom: ${$bottom}px;
    z-index: ${theme.zIndex.sticky};
  `}

  ${({ theme, $showBorderTop }) =>
    $showBorderTop &&
    css`
      border-top: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};

      &:empty {
        border: none;
      }
    `}
`;

export default Content;
