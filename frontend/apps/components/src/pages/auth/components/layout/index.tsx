import type { FootprintVariant } from '@onefootprint/footprint-js';
import { Layout as AppLayout } from '@onefootprint/idv-elements';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import React from 'react';

type LayoutProps = {
  children: React.ReactNode;
  isSandbox?: boolean;
  onClose?: (() => void) | undefined;
  variant?: FootprintVariant;
  config?: PublicOnboardingConfig;
};

const Layout = ({
  children,
  variant,
  isSandbox,
  onClose,
  config,
}: LayoutProps) => (
  <AppLayout
    isSandbox={isSandbox}
    onClose={onClose}
    options={{ hasDesktopBorderRadius: true }}
    variant={variant}
    config={config}
  >
    {children}
  </AppLayout>
);

export default Layout;
