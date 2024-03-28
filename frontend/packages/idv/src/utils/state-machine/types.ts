import type {
  IdDocOutcome,
  IdvBootstrapData,
  ObConfigAuth,
  OverallOutcome,
  PublicOnboardingConfig,
} from '@onefootprint/types';

import type { DeviceInfo } from '../../hooks';
import type {
  AuthTokenPayload,
  DeviceResponseJsonPayload,
} from './utils/custom-listener';

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
  bootstrapData?: IdvBootstrapData;
  isTransfer?: boolean;
  isComponentsSdk?: boolean;
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
        sandboxId: string;
        overallOutcome: OverallOutcome;
      };
    }
  | {
      type: 'identifyCompleted';
      payload: {
        authToken: string;
        // TODO do we really need these? They are passed in as bootstrap data to the collect KYC
        // data machine, which doesn't really make sense
        email?: string;
        phoneNumber?: string;
      };
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
