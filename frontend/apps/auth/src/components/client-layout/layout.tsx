import type { FootprintVariant } from '@onefootprint/footprint-js';
import { Layout as AppLayout } from '@onefootprint/idv';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import type React from 'react';

type LayoutProps = {
  children: React.ReactNode;
  isSandbox?: boolean;
  onClose?: (() => void) | undefined;
  variant?: FootprintVariant;
  config?: PublicOnboardingConfig;
};

const Layout = ({ children, config, isSandbox, onClose, variant }: LayoutProps) => (
  <AppLayout
    config={config}
    isSandbox={isSandbox}
    onClose={onClose}
    options={{ hasDesktopBorderRadius: true }}
    variant={variant}
  >
    {children}
  </AppLayout>
);

export default Layout;
