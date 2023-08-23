import type { DeviceInfo } from '@onefootprint/idv-elements';
import {
  IdDocOutcomes,
  IdvBootstrapData,
  ObConfigAuth,
  PublicOnboardingConfig,
} from '@onefootprint/types';

export type MachineContext = {
  // Inputs
  authToken?: string;
  bootstrapData?: IdvBootstrapData;
  isTransfer?: boolean;
  obConfigAuth?: ObConfigAuth;
  onClose?: () => void;
  onComplete?: (validationToken?: string, delay?: number) => void; // Generated
  validationToken?: string;
  userFound?: boolean;
  showCompletionPage?: boolean;
  showLogo?: boolean;
  idDocOutcome?: IdDocOutcomes;
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
      type: 'identifyCompleted';
      payload: {
        authToken: string;
        userFound: boolean;
        email?: string;
        phoneNumber?: string;
        idDocOutcome?: IdDocOutcomes;
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
    };
