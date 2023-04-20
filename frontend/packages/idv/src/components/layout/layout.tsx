import { media } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import React, { useCallback, useState } from 'react';
import useMeasure from 'react-use-measure';
import styled, { css } from 'styled-components';

import useAppContext from '../../hooks/use-app-context';
import useSandboxMode from '../../hooks/use-sandbox-mode';
import FootprintFooter from './components/footprint-footer';
import NavigationHeaderContainer from './components/navigation-header/components/navigation-header-container';
import SandboxBanner, {
  SandboxBannerHandler,
} from './components/sandbox-banner';
import { LAYOUT_CONTAINER_ID, LAYOUT_HEADER_ID } from './constants';

export const BIFROST_CONTAINER_ID = 'bifrost-container-id';
const SHIMMER_HEIGHT = '296px';

type IdvLayoutProps = {
  children: React.ReactNode;
};

const IdvLayout = ({ children }: IdvLayoutProps) => {
  const {
    layout: { header, footer, container },
  } = useAppContext();
  const { isSandbox } = useSandboxMode();
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
    <Container
      id={LAYOUT_CONTAINER_ID}
      hasBorderRadius={!!container.hasBorderRadius}
    >
      <DialogContent>
        <Header id={LAYOUT_HEADER_ID}>
          {isSandbox && (
            <SandboxBanner
              ref={measuredRef}
              hideOnDesktop={header.hideDesktopSandboxBanner}
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
          variant={footer.footerVariant}
          hideOnDesktop={footer.hideDesktopFooter}
        />
      </DialogContent>
    </Container>
  );
};

const Container = styled(motion.div)<{ hasBorderRadius: boolean }>`
  ${({ theme }) => css`
    background: ${theme.components.bifrost.dialog.bg};
    display: flex;
    flex-direction: column;
    height: 100vh;
    margin: 0;
    overflow-y: auto;
    position: relative;

    ${media.greaterThan('md')`
      height: auto;
      margin: ${theme.spacing[9]} auto ${theme.spacing[9]};
      max-height: calc(100vh - (2 * ${theme.spacing[9]}));
      max-width: 480px;
    `}
  `}

  ${({ hasBorderRadius, theme }) =>
    hasBorderRadius &&
    css`
      ${media.greaterThan('md')`
      border-radius: ${theme.components.bifrost.dialog.borderRadius};
    `}
    `}
`;

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

export default IdvLayout;
