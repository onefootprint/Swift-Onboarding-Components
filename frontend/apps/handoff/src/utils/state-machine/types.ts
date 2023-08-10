import {
  D2PStatus,
  IdDocOutcomes,
  OnboardingConfig,
} from '@onefootprint/types';

export type MachineContext = {
  opener?: string;
  authToken?: string;
  onboardingConfig?: OnboardingConfig;
  idDocOutcome?: IdDocOutcomes;
};

export type MachineEvents =
  | InitContextUpdatedEvent
  | {
      type: 'd2pAlreadyCompleted';
    }
  | {
      type: 'statusReceived';
      payload: {
        isError?: boolean;
        status?: D2PStatus;
      };
    }
  | {
      type: 'idvCompleted';
    }
  | {
      type: 'reset';
    };

export type InitContextUpdatedEvent = {
  type: 'initContextUpdated';
  payload: {
    authToken?: string;
    opener?: string;
    onboardingConfig?: OnboardingConfig;
    idDocOutcome?: IdDocOutcomes;
  };
};
