import {
  FootprintFooter,
  NavigationHeaderContainer,
  SandboxBanner,
  SandboxBannerHandler,
} from '@onefootprint/footprint-elements';
import { useTranslation } from '@onefootprint/hooks';
import { media } from '@onefootprint/ui';
import React, { useCallback, useState } from 'react';
import useSandboxMode from 'src/hooks/use-sandbox-mode';
import styled, { css } from 'styled-components';

import BIFROST_CONTAINER_ID from './constants';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const { t } = useTranslation('components.sandbox-banner');
  const { isSandbox } = useSandboxMode();
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
    <LayoutContainer id={BIFROST_CONTAINER_ID}>
      <Header>
        {isSandbox && <SandboxBanner ref={measuredRef} label={t('label')} />}
        <NavigationHeaderContainer
          top={isSandbox ? sandboxBannerHeight : undefined}
          containerId={BIFROST_CONTAINER_ID}
        />
      </Header>
      <Body>{children}</Body>
      <FootprintFooter />
    </LayoutContainer>
  );
};

const LayoutContainer = styled.div`
  ${({ theme }) => css`
    background: ${theme.components.bifrost.dialog.bg};
    display: flex;
    flex-direction: column;
    height: 100vh;
    margin: 0;
    overflow-y: auto;
    position: relative;

    > *:first-child {
      border-top-left-radius: ${theme.components.bifrost.dialog.borderRadius};
      border-top-right-radius: ${theme.components.bifrost.dialog.borderRadius};
    }

    > *:last-child {
      border-bottom-left-radius: ${theme.components.bifrost.dialog
        .borderRadius};
      border-bottom-right-radius: ${theme.components.bifrost.dialog
        .borderRadius};
    }

    ${media.greaterThan('md')`
      height: unset;
      margin: ${theme.spacing[9]} auto ${theme.spacing[9]};
      max-height: calc(100vh - (2 * ${theme.spacing[9]}));
      max-width: 480px;
      border-radius: ${theme.components.bifrost.dialog.borderRadius};
    `}
  `}
`;

const Body = styled.div`
  ${({ theme }) => css`
    flex: 1 0 auto;
    padding: ${theme.spacing[5]};

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
