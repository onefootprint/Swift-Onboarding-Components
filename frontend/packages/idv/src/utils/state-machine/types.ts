import type { IdDocOutcome, ObConfigAuth, OverallOutcome, PublicOnboardingConfig } from '@onefootprint/types';

import type { DoneArgs } from '../../components/identify';
import type { DeviceInfo } from '../../hooks';
import type { UserData } from '../../types';
import type { AuthTokenPayload, DeviceResponseJsonPayload } from './utils/custom-listener';

export type ComponentsSdkContext = {
  onRelayFromComponents: (cb: () => void) => () => void;
  relayToComponents: (authToken: string) => void;
};

/** These constant properties are often passed around to other idv machines */
export type CommonIdvContext = {
  device: DeviceInfo;
  authToken: string;
  isTransfer?: boolean;
  componentsSdkContext?: ComponentsSdkContext;
  isInIframe?: boolean;
};

export type CompletePayload = {
  validationToken?: string;
  authToken?: string; // auth token used for onboarding flow
  deviceResponseJson?: string; // from passkey registration
};

export type MachineContext = {
  // Inputs
  config?: PublicOnboardingConfig;
  device?: DeviceInfo;
  authToken?: string;
  userData: UserData;
  isTransfer?: boolean;
  componentsSdkContext?: ComponentsSdkContext;
  isInIframe?: boolean;
  obConfigAuth?: ObConfigAuth;
  validationToken?: string;
  showLogo?: boolean;
  idDocOutcome?: IdDocOutcome;
  sandboxId?: string;
  overallOutcome?: OverallOutcome;
  deviceResponseJson?: string;
  onClose?: () => void;
  onComplete?: (payload: CompletePayload) => void; // Generated
};

export type MachineEvents =
  | {
      type: 'initContextUpdated';
      payload: {
        config?: PublicOnboardingConfig;
        device?: DeviceInfo;
      };
    }
  | {
      type: 'configRequestFailed';
    }
  | {
      type: 'sandboxOutcomeSubmitted';
      payload: {
        idDocOutcome?: IdDocOutcome;
        sandboxId?: string;
        overallOutcome: OverallOutcome;
      };
    }
  | {
      type: 'identifyCompleted';
      payload: DoneArgs;
    }
  | {
      type: 'onboardingCompleted';
      payload: {
        validationToken?: string;
      };
    }
  | {
      type: 'reset';
    }
  | {
      type: 'expireSession';
    }
  | AuthTokenPayload
  | DeviceResponseJsonPayload;
