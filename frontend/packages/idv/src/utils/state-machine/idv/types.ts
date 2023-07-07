import { DeviceInfo } from '@onefootprint/idv-elements';
import {
  IdvBootstrapData,
  ObConfigAuth,
  OnboardingConfig,
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
};

export type MachineEvents =
  | {
      type: 'initContextUpdated';
      payload: {
        config?: OnboardingConfig;
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
