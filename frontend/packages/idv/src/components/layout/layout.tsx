import type { FootprintVariant } from '@onefootprint/footprint-js';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import React from 'react';

import Content from './components/content';
import FullHeightContainer from './components/full-height-container';
import { LayoutOptionsProvider } from './components/layout-options-provider';
import { LAYOUT_CONTAINER_ID } from './constants';
import type { Options } from './types';

export const BIFROST_CONTAINER_ID = 'bifrost-container-id';

export type LayoutProps = {
  variant?: FootprintVariant;
  children: React.ReactNode;
  options?: Options;
  isSandbox?: boolean;
  onClose?: () => void;
  config?: PublicOnboardingConfig;
};

const Layout = ({ children, variant, options = {}, isSandbox, onClose, config }: LayoutProps) => (
  <LayoutOptionsProvider options={options} onClose={onClose}>
    <FullHeightContainer variant={variant} id={LAYOUT_CONTAINER_ID} hasBorderRadius={!!options.hasDesktopBorderRadius}>
      <Content isSandbox={isSandbox} config={config}>
        {children}
      </Content>
    </FullHeightContainer>
  </LayoutOptionsProvider>
);

export default Layout;
