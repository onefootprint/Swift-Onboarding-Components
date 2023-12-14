import type { DeviceInfo } from '@onefootprint/idv-elements';
import type {
  IdDocOutcome,
  IdvBootstrapData,
  ObConfigAuth,
  OverallOutcome,
  PublicOnboardingConfig,
} from '@onefootprint/types';

export type MachineContext = {
  // Inputs
  config?: PublicOnboardingConfig;
  device?: DeviceInfo;
  authToken?: string;
  bootstrapData?: IdvBootstrapData;
  isTransfer?: boolean;
  obConfigAuth?: ObConfigAuth;
  validationToken?: string;
  userFound?: boolean;
  showCompletionPage?: boolean;
  showLogo?: boolean;
  idDocOutcome?: IdDocOutcome;
  sandboxId?: string;
  overallOutcome?: OverallOutcome;
  onClose?: () => void;
  onComplete?: (validationToken?: string, delay?: number) => void; // Generated
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
        userFound: boolean;
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
  | {
      type: 'authTokenChanged';
      payload: { authToken: string };
    };
