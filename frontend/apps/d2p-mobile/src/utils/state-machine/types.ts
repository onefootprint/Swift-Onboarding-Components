export enum States {
  init = 'init',
  biometricRegister = 'biometricRegister',
  biometricRegisterRetry = 'biometricRegisterRetry',
  biometricUnavailable = 'biometricUnavailable',
  biometricSuccess = 'biometricSuccess',
  biometricCanceled = 'biometricCanceled',
}

export enum Events {
  deviceInfoIdentified = 'deviceInfoIdentified',
  biometricRegisterFailed = 'biometricRegisterFailed',
  biometricRegisterSucceeded = 'biometricRegisterSucceeded',
  biometricCanceled = 'biometricCanceled',
}

export enum Actions {
  assignDeviceInfo = 'assignDeviceInfo',
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
  | {
      type: Events.deviceInfoIdentified;
      payload: {
        hasSupportForWebAuthn: boolean;
        type: string;
      };
    }
  | { type: Events.biometricRegisterFailed }
  | { type: Events.biometricRegisterSucceeded }
  | { type: Events.biometricCanceled };
