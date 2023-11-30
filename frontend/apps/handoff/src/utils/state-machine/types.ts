import type {
  D2PStatus,
  IdDocOutcome,
  L10n,
  PublicOnboardingConfig,
} from '@onefootprint/types';

export type MachineContext = {
  opener?: string;
  authToken?: string;
  onboardingConfig?: PublicOnboardingConfig;
  idDocOutcome?: IdDocOutcome;
  l10n?: L10n;
  updatedStatus?: boolean;
};

export type MachineEvents =
  | InitContextUpdatedEvent
  | {
      type: 'd2pAlreadyCompleted';
    }
  | {
      type: 'd2pCanceled';
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
    idDocOutcome?: IdDocOutcome;
    l10n?: L10n;
    updatedStatus?: boolean;
  };
};
