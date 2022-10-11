import { DeviceInfo } from '@onefootprint/hooks';
import { TenantInfo } from '@onefootprint/types';

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
  tenant?: TenantInfo;
  authToken?: string;
};

export type MachineEvents =
  | {
      type: Events.receivedContext;
      payload: {
        authToken: string;
        tenant: TenantInfo;
        device: DeviceInfo;
      };
    }
  | { type: Events.failed }
  | { type: Events.skipped }
  | { type: Events.succeeded }
  | { type: Events.completed };
