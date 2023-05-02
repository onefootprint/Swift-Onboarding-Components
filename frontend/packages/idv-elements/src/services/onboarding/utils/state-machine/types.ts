import { DeviceInfo } from '@onefootprint/hooks';
import { OnboardingConfig } from '@onefootprint/types';

import { KycData } from '../../../../plugins/collect-kyc-data/types';

export type MachineContext = {
  tenantPk: string;
  sandboxSuffix?: string; // only if in sandbox mode
  authToken: string;
  data: KycData; // TODO: generalize this more in the next iteration
  config?: OnboardingConfig;
  device?: DeviceInfo;
  userFound?: boolean;
  validationToken?: string;
  onClose?: () => void;
  onComplete?: (validationToken: string, delay?: number) => void;
};

export type MachineEvents =
  | {
      type: 'initContextUpdated';
      payload: {
        validationToken?: string;
        config?: OnboardingConfig;
        device?: DeviceInfo;
      };
    }
  | {
      type: 'configRequestFailed';
    }
  | {
      type: 'requirementsCompleted';
    }
  | {
      type: 'authorized';
      payload: {
        validationToken: string;
      };
    };
