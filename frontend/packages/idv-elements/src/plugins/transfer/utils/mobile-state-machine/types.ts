import { IdDocOutcomes, OnboardingConfig } from '@onefootprint/types';

import type { DeviceInfo } from '../../../../hooks/ui/use-device-info';

export type MachineContext = {
  device: DeviceInfo;
  authToken: string;
  scopedAuthToken: string;
  tab?: Window;
  config?: OnboardingConfig;
  idDocOutcome?: IdDocOutcomes;
};

export type MachineEvents =
  | {
      type: 'receivedContext';
      payload: {
        device: DeviceInfo;
        authToken: string;
        idDocOutcome?: IdDocOutcomes;
        config: OnboardingConfig;
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
