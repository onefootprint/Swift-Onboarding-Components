import { DeviceInfo } from 'hooks';

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
  authTokenReceived = 'authTokenReceived',
  deviceInfoIdentified = 'deviceInfoIdentified',
  registerFailed = 'registerFailed',
  registerSucceeded = 'registerSucceeded',
  canceled = 'canceled',
  statusPollingErrored = 'statusPollingErrored',
}

export enum Actions {
  assignDeviceInfo = 'assignDeviceInfo',
  assignAuthToken = 'assignAuthToken',
  clearAuthToken = 'clearAuthToken',
}

export type BiometricContext = {
  device?: DeviceInfo;
  authToken: string;
};

export type BiometricEvent =
  | { type: Events.authTokenReceived; payload: { authToken: string } }
  | {
      type: Events.deviceInfoIdentified;
      payload: DeviceInfo;
    }
  | { type: Events.registerFailed }
  | { type: Events.registerSucceeded }
  | { type: Events.canceled }
  | { type: Events.statusPollingErrored };
