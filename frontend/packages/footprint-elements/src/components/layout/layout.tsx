import { media } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import React, { useCallback, useState } from 'react';
import useMeasure from 'react-use-measure';
import styled, { css } from 'styled-components';

import FootprintFooter from '../footprint-footer';
import NavigationHeaderContainer from '../navigation-header/components/navigation-header-container';
import SandboxBanner, { SandboxBannerHandler } from '../sandbox-banner';
import FullHeightContainer from './components/full-height-container';
import { LAYOUT_CONTAINER_ID, LAYOUT_HEADER_ID } from './constants';

type LayoutProps = {
  children: React.ReactNode;
  hasSandboxBanner?: boolean;
  hasBorderRadius?: boolean;
};

const SHIMMER_HEIGHT = '296px';

const Layout = ({
  children,
  hasSandboxBanner,
  hasBorderRadius = false,
}: LayoutProps) => {
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
    <FullHeightContainer
      id={LAYOUT_CONTAINER_ID}
      hasBorderRadius={hasBorderRadius}
    >
      <DialogContent>
        <Header id={LAYOUT_HEADER_ID}>
          {hasSandboxBanner && <SandboxBanner ref={measuredRef} />}
          <NavigationHeaderContainer
            top={hasSandboxBanner ? sandboxBannerHeight : undefined}
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
        <FootprintFooter />
      </DialogContent>
    </FullHeightContainer>
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
    flex: 0;
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
