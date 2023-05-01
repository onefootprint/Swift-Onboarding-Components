import { D2PStatus } from '@onefootprint/types';

export type MachineContext = {
  authToken?: string;
  // opener?: string;
  // onboardingConfig?: OnboardingConfig;
  // requirements?: Requirements;
};

export type Requirements = {
  missingIdDoc?: boolean;
  missingLiveness?: boolean;
  missingSelfie?: boolean;
  missingConsent?: boolean;
};

export type MachineEvents =
  | {
      type: 'started';
      payload: {
        authToken?: string;
      };
    }
  | {
      type: 'completed';
    }
  | {
      type: 'statusReceived';
      payload: {
        isError?: boolean;
        status?: D2PStatus;
      };
    }
  | {
      type: 'requirementsReceived';
      payload: {
        missingIdDoc?: boolean;
        missingSelfie?: boolean;
        missingLiveness?: boolean;
        missingConsent?: boolean;
      };
    }
  | {
      type: 'requirementCompleted';
    }
  | {
      type: 'reset';
    };
