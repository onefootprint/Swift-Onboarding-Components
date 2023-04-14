import { media } from '@onefootprint/ui';
import React, { useCallback, useState } from 'react';
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

type IdvLayoutProps = {
  children: React.ReactNode;
};

const IdvLayout = ({ children }: IdvLayoutProps) => {
  const {
    layout: { header, footer, container },
  } = useAppContext();
  const { isSandbox } = useSandboxMode();
  const shouldShowSandboxBanner = isSandbox && !header.hideSandboxBanner;

  const [sandboxBannerHeight, setSandboxBannerHeight] = useState(0);

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
      <Header id={LAYOUT_HEADER_ID}>
        {shouldShowSandboxBanner && <SandboxBanner ref={measuredRef} />}
        <NavigationHeaderContainer
          top={shouldShowSandboxBanner ? sandboxBannerHeight : undefined}
          containerId={LAYOUT_CONTAINER_ID}
        />
      </Header>
      <Body>{children}</Body>
      {footer.hideFooter ? null : (
        <FootprintFooter variant={footer.footerVariant} />
      )}
    </Container>
  );
};

const Container = styled.div<{ hasBorderRadius: boolean }>`
  ${({ theme }) => css`
    background: ${theme.components.bifrost.dialog.bg};
    display: flex;
    flex-direction: column;
    height: 100vh;
    margin: 0;
    overflow-y: auto;
    position: relative;

    ${media.greaterThan('md')`
      height: unset;
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

const Body = styled.div`
  ${({ theme }) => css`
    flex: 1 0 auto;
    padding: ${theme.spacing[5]};
    display: flex;
    flex-direction: column;
    position: relative;

    ${media.greaterThan('md')`
      padding: 0 ${theme.spacing[7]} ${theme.spacing[7]};
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

export default IdvLayout;
