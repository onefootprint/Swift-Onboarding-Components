import { IdDocOutcomes, OnboardingConfig } from '@onefootprint/types';

import type { DeviceInfo } from '../../../../hooks/ui/use-device-info';
import { TransferRequirements } from '../../types';

export type MachineContext = {
  // Plugin context
  authToken?: string;
  scopedAuthToken?: string;
  device?: DeviceInfo;
  missingRequirements: TransferRequirements;
  config?: OnboardingConfig;
  idDocOutcome?: IdDocOutcomes;
};

export type MachineEvents =
  | {
      type: 'receivedContext';
      payload: {
        authToken: string;
        device: DeviceInfo;
        config: OnboardingConfig;
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
