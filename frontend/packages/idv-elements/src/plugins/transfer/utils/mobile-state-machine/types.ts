import type {
  IdDocOutcomes,
  PublicOnboardingConfig,
} from '@onefootprint/types';

import type { DeviceInfo } from '../../../../hooks/ui/use-device-info';

export type MachineContext = {
  device: DeviceInfo;
  authToken: string;
  scopedAuthToken: string;
  tab?: Window;
  config?: PublicOnboardingConfig;
  idDocOutcome?: IdDocOutcomes;
};

export type MachineEvents =
  | {
      type: 'receivedContext';
      payload: {
        device: DeviceInfo;
        authToken: string;
        idDocOutcome?: IdDocOutcomes;
        config: PublicOnboardingConfig;
      };
    }
  | {
      type: 'scopedAuthTokenGenerated';
      payload: {
        scopedAuthToken: string;
      };
    }
  | { type: 'statusPollingErrored' }
  | {
      type: 'newTabOpened';
      payload: {
        tab: Window;
      };
    }
  | { type: 'newTabRegisterFailed' }
  | { type: 'livenessSkipped' }
  | { type: 'newTabRegisterSucceeded' }
  | { type: 'newTabRegisterCanceled' };
