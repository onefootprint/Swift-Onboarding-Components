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

export type DeviceInfo = {
  hasSupportForWebAuthn: boolean;
  type: string;
};

export type D2PContext = {
  device: DeviceInfo;
  authToken: string;
};

export type D2PEvent =
  | { type: Events.authTokenReceived; payload: { authToken: string } }
  | {
      type: Events.deviceInfoIdentified;
      payload: {
        hasSupportForWebAuthn: boolean;
        type: string;
      };
    }
  | { type: Events.registerFailed }
  | { type: Events.registerSucceeded }
  | { type: Events.canceled }
  | { type: Events.statusPollingErrored };
