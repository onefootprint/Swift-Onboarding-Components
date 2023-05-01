import { FootprintAppearance } from '@onefootprint/footprint-js';
import { UserData } from '@onefootprint/types';

export type IdvProps = {
  data: IdvData;
  layout?: IdvLayout;
  callbacks?: IdvCallbacks;
  appearance?: FootprintAppearance;
};

export type IdvCallbacks = {
  onClose?: () => void;
  onComplete?: (validationToken: string, delay?: number) => void;
};

export type IdvData = {
  authToken?: string;
  tenantPk?: string;
  userData?: UserData;
};

export type IdvLayout = {
  hideDesktopSandboxBanner?: boolean;
  hideDesktopFooter?: boolean;
  hasDesktopBorderRadius?: boolean;
};
