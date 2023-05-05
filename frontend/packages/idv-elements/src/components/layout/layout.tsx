import { media } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import React, { useCallback, useState } from 'react';
import useMeasure from 'react-use-measure';
import styled, { css } from 'styled-components';

import FootprintFooter from './components/footprint-footer';
import FullHeightContainer from './components/full-height-container';
import LayoutOptionsProvider from './components/layout-options-provider';
import NavigationHeaderContainer from './components/navigation-header/components/navigation-header-container';
import SandboxBanner, {
  SandboxBannerHandler,
} from './components/sandbox-banner';
import { LAYOUT_CONTAINER_ID, LAYOUT_HEADER_ID } from './constants';
import useExtendedAppearance from './hooks/use-extended-appearance';
import { LayoutOptions } from './types';

export const BIFROST_CONTAINER_ID = 'bifrost-container-id';
const SHIMMER_HEIGHT = '296px';

type LayoutProps = {
  children: React.ReactNode;
  options?: LayoutOptions;
  appearance?: Record<string, any>;
  tenantPk?: string;
  isSandbox?: boolean;
  onClose?: () => void;
};

const Layout = ({
  children,
  options = {},
  tenantPk,
  isSandbox,
  appearance,
  onClose,
}: LayoutProps) => {
  const {
    hideDesktopSandboxBanner,
    hideDesktopFooter,
    hasDesktopBorderRadius,
  } = options;

  useExtendedAppearance(appearance);
  const [sandboxBannerHeight, setSandboxBannerHeight] = useState(0);
  const [refBody, { height: bodyHeight }] = useMeasure();

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
    <LayoutOptionsProvider options={options} onClose={onClose}>
      <FullHeightContainer
        id={LAYOUT_CONTAINER_ID}
        hasBorderRadius={!!hasDesktopBorderRadius}
      >
        <DialogContent>
          <Header id={LAYOUT_HEADER_ID}>
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
          </Header>
          <Body
            animate={{ height: bodyHeight || SHIMMER_HEIGHT }}
            transition={{
              duration: 0.15,
              type: 'spring',
            }}
          >
            <BodyContent ref={refBody}>{children}</BodyContent>
          </Body>
          <FootprintFooter
            hideOnDesktop={hideDesktopFooter}
            tenantPk={tenantPk}
          />
        </DialogContent>
      </FullHeightContainer>
    </LayoutOptionsProvider>
  );
};

const Body = styled(motion.div)`
  flex: 1 0 auto;
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

    ${media.greaterThan('md')`
      padding: 0 ${theme.spacing[7]} ${theme.spacing[8]}; 
    `}
  `}
`;

const Header = styled.div`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.primary};
    position: sticky;
    top: 0;
    z-index: ${theme.zIndex.sticky};
  `}
`;

const DialogContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;

  ${media.greaterThan('md')`
    height: auto;
  `}
`;

export default Layout;
