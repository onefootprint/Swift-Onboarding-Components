import styled from '@onefootprint/styled';
import { media } from '@onefootprint/ui';
import React, { useEffect, useState } from 'react';

import hasCustomHeightInAppearance from '../../utils/has-custom-height-in-appearance';
import FootprintFooter from '../footprint-footer';
import { useLayoutOptions } from '../layout-options-provider';
import Body from './components/body';
import Header from './components/header';

type ContentProps = {
  children: React.ReactNode;
  tenantPk?: string;
  isSandbox?: boolean;
};

const Content = ({ children, tenantPk, isSandbox }: ContentProps) => {
  const { appearance, options } = useLayoutOptions();
  const { hideDesktopSandboxBanner, hideDesktopFooter, fixContainerSize } =
    options || {};

  const [hasCustomHeight, setHasCustomHeight] = useState(false);
  useEffect(() => {
    if (!fixContainerSize && hasCustomHeightInAppearance(appearance ?? {})) {
      setHasCustomHeight(true);
    }
  }, [appearance, fixContainerSize]);

  return (
    <Container data-has-custom-height={!!hasCustomHeight}>
      <Header
        isSandbox={isSandbox}
        hideDesktopSandboxBanner={hideDesktopSandboxBanner}
      />
      <Body>{children}</Body>
      <FootprintFooter hideOnDesktop={hideDesktopFooter} tenantPk={tenantPk} />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;

  ${media.greaterThan('md')`
    &[data-has-custom-height='false'] {
      height: auto;
    }
  `}
`;

export default Content;
