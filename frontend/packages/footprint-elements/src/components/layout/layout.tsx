import { media } from '@onefootprint/ui';
import React, { useCallback, useState } from 'react';
import styled, { css } from 'styled-components';

import NavigationHeaderContainer from '../navigation-header/components/navigation-header-container';
import SandboxBanner, { SandboxBannerHandler } from '../sandbox-banner';
import { LAYOUT_CONTAINER_ID, LAYOUT_HEADER_ID } from './constants';

type LayoutProps = {
  children: React.ReactNode;
  footer: React.ReactNode;
  isSandbox?: boolean;
  hasBorderRadius?: boolean;
};

const Layout = ({
  children,
  footer,
  isSandbox,
  hasBorderRadius = false,
}: LayoutProps) => {
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
    <Container id={LAYOUT_CONTAINER_ID} hasBorderRadius={hasBorderRadius}>
      <Header id={LAYOUT_HEADER_ID}>
        {isSandbox && <SandboxBanner ref={measuredRef} />}
        <NavigationHeaderContainer
          top={isSandbox ? sandboxBannerHeight : undefined}
          containerId={LAYOUT_CONTAINER_ID}
        />
      </Header>
      <Body>{children}</Body>
      {footer}
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
      overflow: hidden;
    `}
    `}
`;

const Body = styled.div`
  ${({ theme }) => css`
    flex: 1 0 auto;
    padding: ${theme.spacing[5]};
    display: flex;
    flex-direction: column;

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

export default Layout;
