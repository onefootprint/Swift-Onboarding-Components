import { DeviceInfo } from '@onefootprint/hooks';
import { D2PStatus, OnboardingConfig } from '@onefootprint/types';

export enum States {
  init = 'init',
  router = 'router',
  checkRequirements = 'checkRequirements',
  liveness = 'liveness',
  idDoc = 'idDoc',
  canceled = 'canceled',
  expired = 'expired',
  complete = 'complete',
}

export enum Events {
  initContextUpdated = 'initContextUpdated',
  requirementsReceived = 'requirementsReceived', // Fetching onboarding requirements is complete
  requirementCompleted = 'requirementCompleted',
  statusReceived = 'statusReceived', // Fetching d2p status is complete
  d2pAlreadyCompleted = 'd2pAlreadyCompleted',
  reset = 'reset',
}

export enum Actions {
  assignInitContext = 'assignInitContext',
  assignRequirements = 'assignRequirements',
  resetContext = 'resetContext',
}

export type MachineContext = {
  device?: DeviceInfo;
  opener?: string;
  authToken?: string;
  onboardingConfig?: OnboardingConfig;
  requirements?: Requirements;
};

export type Requirements = {
  missingIdDoc?: boolean;
  missingLiveness?: boolean;
  missingSelfie?: boolean;
  missingConsent?: boolean;
};

export type MachineEvents =
  | {
      type: Events.d2pAlreadyCompleted;
    }
  | {
      type: Events.initContextUpdated;
      payload: {
        authToken?: string;
        opener?: string;
        device?: DeviceInfo;
        onboardingConfig?: OnboardingConfig;
        requirements?: Requirements;
      };
    }
  | {
      type: Events.statusReceived;
      payload: {
        isError?: boolean;
        status?: D2PStatus;
      };
    }
  | {
      type: Events.requirementsReceived;
      payload: {
        missingIdDoc?: boolean;
        missingSelfie?: boolean;
        missingLiveness?: boolean;
        missingConsent?: boolean;
      };
    }
  | {
      type: Events.requirementCompleted;
    }
  | {
      type: Events.reset;
    };
