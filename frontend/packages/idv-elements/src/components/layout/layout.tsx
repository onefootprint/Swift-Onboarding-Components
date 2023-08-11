import { FootprintVariant } from '@onefootprint/footprint-js';
import React from 'react';

import Content from './components/content';
import FullHeightContainer from './components/full-height-container';
import LayoutOptionsProvider from './components/layout-options-provider';
import { LAYOUT_CONTAINER_ID } from './constants';
import { Options } from './types';

export const BIFROST_CONTAINER_ID = 'bifrost-container-id';

type LayoutProps = {
  variant?: FootprintVariant;
  children: React.ReactNode;
  options?: Options;
  tenantPk?: string;
  isSandbox?: boolean;
  onClose?: () => void;
};

const Layout = ({
  children,
  variant,
  options = {},
  tenantPk,
  isSandbox,
  onClose,
}: LayoutProps) => (
  <LayoutOptionsProvider options={options} onClose={onClose}>
    <FullHeightContainer
      variant={variant}
      id={LAYOUT_CONTAINER_ID}
      hasBorderRadius={!!options.hasDesktopBorderRadius}
    >
      <Content tenantPk={tenantPk} isSandbox={isSandbox}>
        {children}
      </Content>
    </FullHeightContainer>
  </LayoutOptionsProvider>
);

export default Layout;
