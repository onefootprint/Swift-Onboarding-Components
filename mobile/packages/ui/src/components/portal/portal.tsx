import React from 'react';
import { Portal as PortalizePortal } from 'react-native-portalize';

export type PortalProps = {
  children: JSX.Element;
  enabled?: boolean;
};

const Portal = ({ children, enabled = true }: PortalProps) =>
  enabled ? <PortalizePortal>{children}</PortalizePortal> : children;

export default Portal;
