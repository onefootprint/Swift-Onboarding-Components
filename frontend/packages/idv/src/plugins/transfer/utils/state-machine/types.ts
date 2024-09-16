import type { IdDocOutcome, PublicOnboardingConfig } from '@onefootprint/types';

import type { DeviceInfo } from '../../../../hooks';
import type { TransferRequirements } from '../../types';

export type MachineContext = {
  device: DeviceInfo;
  authToken: string;
  scopedAuthToken: string;
  missingRequirements: TransferRequirements;
  isContinuingOnDesktop?: boolean;
  config?: PublicOnboardingConfig;
  tab?: Window;
  idDocOutcome?: IdDocOutcome;
  isSocialMediaBrowser?: boolean;
  isInIframe: boolean;
  isTransferFromDesktopToMobileDisabled?: boolean;
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
  | { type: 'd2pSessionExpired' }
  | { type: 'confirmationRequired' }
  | { type: 'continueOnDesktop' }
  | { type: 'continueOnMobile' };
