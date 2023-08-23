import styled, { css } from '@onefootprint/styled';
import React, { useCallback, useState } from 'react';

import { LAYOUT_CONTAINER_ID, LAYOUT_HEADER_ID } from '../../../../constants';
import NavigationHeaderContainer from '../../../navigation-header/components/navigation-header-container';
import SandboxBanner, { SandboxBannerHandler } from '../../../sandbox-banner';

type HeaderProps = {
  hideDesktopSandboxBanner?: boolean;
  isSandbox?: boolean;
};

const Header = ({ hideDesktopSandboxBanner, isSandbox }: HeaderProps) => {
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
    <Container id={LAYOUT_HEADER_ID}>
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
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    position: sticky;
    top: 0;
    z-index: ${theme.zIndex.sticky};
  `}
`;

export default Header;
