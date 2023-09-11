import type {
  IdDocOutcomes,
  PublicOnboardingConfig,
} from '@onefootprint/types';

import type { DeviceInfo } from '../../../../hooks/ui/use-device-info';
import type { TransferRequirements } from '../../types';

export type MachineContext = {
  // Plugin context
  authToken?: string;
  scopedAuthToken?: string;
  device?: DeviceInfo;
  missingRequirements: TransferRequirements;
  config?: PublicOnboardingConfig;
  idDocOutcome?: IdDocOutcomes;
};

export type MachineEvents =
  | {
      type: 'receivedContext';
      payload: {
        authToken: string;
        device: DeviceInfo;
        config: PublicOnboardingConfig;
        missingRequirements: TransferRequirements;
        idDocOutcome?: IdDocOutcomes;
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
  | { type: 'confirmationRequired' }
  | { type: 'continueOnDesktop' }
  | { type: 'continueOnMobile' }
  | { type: 'qrRegisterSucceeded' }
  | { type: 'qrRegisterFailed' }
  | { type: 'statusPollingErrored' };
