import { FootprintAppearance } from '@onefootprint/footprint-js/src/footprint-js.types';

import { LayoutConfig } from './components/layout';

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

export type BootstrapData = {
  email?: string;
  phoneNumber?: string;
};
