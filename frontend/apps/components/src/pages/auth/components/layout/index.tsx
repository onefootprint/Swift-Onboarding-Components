import type { FootprintVariant } from '@onefootprint/footprint-js';
import { Layout as AppLayout } from '@onefootprint/idv-elements';
import React from 'react';

type LayoutProps = {
  children: React.ReactNode;
  isSandbox?: boolean;
  onClose?: (() => void) | undefined;
  publicKey?: string;
  variant?: FootprintVariant;
};

const Layout = ({
  children,
  variant,
  publicKey,
  isSandbox,
  onClose,
}: LayoutProps) => (
  <AppLayout
    isSandbox={isSandbox}
    onClose={onClose}
    options={{ hasDesktopBorderRadius: true }}
    tenantPk={publicKey}
    variant={variant}
  >
    {children}
  </AppLayout>
);

export default Layout;
