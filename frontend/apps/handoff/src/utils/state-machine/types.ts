import { DeviceInfo } from '@onefootprint/hooks';
import { D2PStatus } from '@onefootprint/types';

export enum States {
  init = 'init',
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
  livenessCompleted = 'livenessCompleted',
  idDocCompleted = 'idDocCompleted',
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
  requirements?: {
    missingIdDoc?: boolean;
    missingLiveness?: boolean;
    missingSelfie?: boolean;
    missingConsent?: boolean;
  };
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
      type: Events.livenessCompleted;
    }
  | {
      type: Events.idDocCompleted;
    }
  | {
      type: Events.reset;
    };
