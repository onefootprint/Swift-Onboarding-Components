import { DeviceInfo } from '@onefootprint/hooks';
import { TenantInfo } from '@onefootprint/types';

export enum States {
  init = 'init',
  register = 'register',
  registerRetry = 'registerRetry',
  unavailable = 'unavailable',
  success = 'success',
  canceled = 'canceled',
  expired = 'expired',
}

export enum Events {
  receivedContext = 'receivedContext',
  registerFailed = 'registerFailed',
  registerSucceeded = 'registerSucceeded',
  canceled = 'canceled',
  statusPollingErrored = 'statusPollingErrored',
}

export enum Actions {
  assignContext = 'assignContext',
  assignAuthToken = 'assignAuthToken',
  clearAuthToken = 'clearAuthToken',
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
  | { type: Events.registerFailed }
  | { type: Events.registerSucceeded }
  | { type: Events.canceled }
  | { type: Events.statusPollingErrored };
