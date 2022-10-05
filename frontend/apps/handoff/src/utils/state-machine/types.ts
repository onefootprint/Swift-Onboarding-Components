import { DeviceInfo } from '@onefootprint/hooks';

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
  paramsReceived = 'paramsReceived',
  deviceInfoIdentified = 'deviceInfoIdentified',
  registerFailed = 'registerFailed',
  registerSucceeded = 'registerSucceeded',
  canceled = 'canceled',
  statusPollingErrored = 'statusPollingErrored',
}

export enum Actions {
  assignDeviceInfo = 'assignDeviceInfo',
  assignAuthToken = 'assignAuthToken',
  assignTenantPk = 'assignTenantPk',
  clearAuthToken = 'clearAuthToken',
}

export type MachineContext = {
  device?: DeviceInfo;
  tenantPk?: string;
  authToken: string;
};

export type MachineEvents =
  | {
      type: Events.paramsReceived;
      payload: { authToken: string; tenantPk?: string };
    }
  | {
      type: Events.deviceInfoIdentified;
      payload: DeviceInfo;
    }
  | { type: Events.registerFailed }
  | { type: Events.registerSucceeded }
  | { type: Events.canceled }
  | { type: Events.statusPollingErrored };
