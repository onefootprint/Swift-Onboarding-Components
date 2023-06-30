import { DeviceInfo } from '@onefootprint/hooks';
import { OnboardingConfig } from '@onefootprint/types';

import { TransferRequirements } from '../../types';

export type MachineContext = {
  // Plugin context
  authToken?: string;
  scopedAuthToken?: string;
  device?: DeviceInfo;
  missingRequirements: TransferRequirements;
  config?: OnboardingConfig;
};

export type MachineEvents =
  | {
      type: 'receivedContext';
      payload: {
        authToken: string;
        device: DeviceInfo;
        config: OnboardingConfig;
        missingRequirements: TransferRequirements;
      };
    }
  | {
      type: 'scopedAuthTokenGenerated';
      payload: {
        scopedAuthToken: string;
      };
    }
  | { type: 'qrCodeCanceled' }
  | { type: 'qrCodeLinkSentViaSms' }
  | { type: 'qrCodeScanned' }
  | { type: 'qrRegisterSucceeded' }
  | { type: 'qrRegisterFailed' }
  | { type: 'statusPollingErrored' };
