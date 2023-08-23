import {
  D2PStatus,
  IdDocOutcomes,
  PublicOnboardingConfig,
} from '@onefootprint/types';

export type MachineContext = {
  opener?: string;
  authToken?: string;
  onboardingConfig?: PublicOnboardingConfig;
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
    onboardingConfig?: PublicOnboardingConfig;
    idDocOutcome?: IdDocOutcomes;
  };
};
