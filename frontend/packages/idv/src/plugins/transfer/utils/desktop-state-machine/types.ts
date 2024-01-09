import type { IdDocOutcome, PublicOnboardingConfig } from '@onefootprint/types';

import type { DeviceInfo } from '../../../../hooks/ui/use-device-info';
import type { TransferRequirements } from '../../types';

export type MachineContext = {
  // Plugin context
  authToken: string;
  scopedAuthToken: string;
  device: DeviceInfo;
  missingRequirements: TransferRequirements;
  config?: PublicOnboardingConfig;
  idDocOutcome?: IdDocOutcome;
};

export type MachineEvents =
  | {
      type: 'scopedAuthTokenGenerated';
      payload: {
        scopedAuthToken: string;
      };
    }
  | { type: 'd2pSessionStarted' }
  | { type: 'd2pSessionCanceled' }
  | { type: 'd2pSessionFailed' }
  | { type: 'd2pSessionCompleted' }
  | { type: 'd2pSessionExpired' }
  | { type: 'confirmationRequired' }
  | { type: 'continueOnDesktop' }
  | { type: 'continueOnMobile' };
