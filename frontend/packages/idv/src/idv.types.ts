import { FootprintAppearance } from '@onefootprint/footprint-js/src/footprint-js.types';

export type IdvProps = {
  data: IdvData;
  layout: IdvLayout;
  callbacks: IdvCallbacks;
  appearance?: FootprintAppearance;
};

export type IdvCallbacks = {
  onClose: () => void;
  onComplete: (validationToken: string, delay?: number) => void;
};

export type IdvData = {
  tenantPk: string;
  bootstrapData?: BootstrapData;
};

export type IdvLayout = {
  header: {
    hideDesktopSandboxBanner?: boolean;
  };
  footer: {
    hideDesktopFooter?: boolean;
    footerVariant?: 'modal' | 'mobile';
  };
  container: {
    hasBorderRadius?: boolean;
  };
  canClose?: boolean;
};

export type BootstrapData = {
  email?: string;
  phoneNumber?: string;
};
