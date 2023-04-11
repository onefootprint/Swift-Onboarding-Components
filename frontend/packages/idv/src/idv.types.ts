import { FootprintAppearance } from '@onefootprint/footprint-js/src/footprint-js.types';

export type IdvProps = {
  config: Config;
  appearance: FootprintAppearance;
  layout: LayoutConfig;
  onClose: () => void;
  onComplete: () => void;
};

export type Config = {
  tenantPk: string;
  bootstrapData?: BootstrapData;
};

export type LayoutConfig = {
  header: {
    hideClose?: boolean;
    hideSandboxBanner?: boolean;
  };
  footer: {
    hideFooter?: boolean;
    footerVariant?: 'modal' | 'mobile';
  };
  container: {
    hasBorderRadius?: boolean;
  };
};

export type BootstrapData = {
  email?: string;
  phoneNumber?: string;
};
