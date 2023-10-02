import type { IdDocOutcome, PublicOnboardingConfig } from '@onefootprint/types';

import type { DeviceInfo } from '../../../../hooks/ui/use-device-info';
import type { TransferRequirements } from '../../types';

export type MachineContext = {
  device: DeviceInfo;
  authToken: string;
  scopedAuthToken: string;
  missingRequirements: TransferRequirements;
  config?: PublicOnboardingConfig;
  tab?: Window;
  idDocOutcome?: IdDocOutcome;
  isSocialMediaBrowser?: boolean;
};

export type MachineEvents =
  | {
      type: 'scopedAuthTokenGenerated';
      payload: {
        scopedAuthToken: string;
      };
    }
  | {
      type: 'newTabOpened';
      payload: {
        tab: Window;
      };
    }
  | { type: 'tabClosed' }
  | { type: 'd2pSessionStarted' }
  | { type: 'd2pSessionCanceled' }
  | { type: 'd2pSessionFailed' }
  | { type: 'd2pSessionCompleted' }
  | { type: 'd2pSessionExpired' };
