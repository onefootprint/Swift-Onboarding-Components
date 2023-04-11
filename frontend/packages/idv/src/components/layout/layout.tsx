import React from 'react';

export const BIFROST_CONTAINER_ID = 'bifrost-container-id';

type FootprintFooterVariant = 'modal' | 'mobile';

export type LayoutConfig = {
  header: {
    hideClose?: boolean;
    hideSandboxBanner?: boolean;
  };
  footer: {
    hideFooter?: boolean;
    footerVariant?: FootprintFooterVariant;
  };
  container: {
    hasBorderRadius?: boolean;
  };
};

type IdvLayoutProps = {
  config: LayoutConfig;
  onClose?: () => void;
  children: React.ReactNode;
};

/*
TODO: implement + test
*/

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const IdvLayout = ({ children, config, onClose }: IdvLayoutProps) => (
  <div>{children}</div>
);

export default IdvLayout;
