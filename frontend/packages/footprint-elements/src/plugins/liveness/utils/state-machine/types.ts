import { DeviceInfo } from '@onefootprint/hooks';

export enum States {
  init = 'init',
  register = 'register',
  retry = 'retry',
  unavailable = 'unavailable',
  success = 'success',
  completed = 'completed',
}

export enum Events {
  receivedContext = 'receivedContext',
  failed = 'failed',
  succeeded = 'succeeded',
  skipped = 'skipped',
  completed = 'completed',
}

export enum Actions {
  assignContext = 'assignContext',
}

export type MachineContext = {
  device?: DeviceInfo;
  authToken?: string;
};

export type MachineEvents =
  | {
      type: Events.receivedContext;
      payload: {
        authToken: string;
        device: DeviceInfo;
      };
    }
  | { type: Events.failed }
  | { type: Events.skipped }
  | { type: Events.succeeded }
  | { type: Events.completed };
