import { OnboardingConfig } from '@onefootprint/types';
import { BootstrapData } from 'src/idv.types';

export type MachineContext = {
  tenantPk: string;
  bootstrapData?: BootstrapData;
  config?: OnboardingConfig;
};

export type MachineEvents = {
  type: 'reset';
};
