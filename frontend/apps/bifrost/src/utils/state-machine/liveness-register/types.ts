export enum States {
  init = 'init',
  biometricRegister = 'biometricRegister',
  biometricRegisterFailure = 'biometricRegisterFailure',
  captchaRegister = 'captchaRegister',
  qrRegister = 'qrRegister',
  livenessRegisterCompleted = 'livenessRegisterCompleted',
}

export type MachineContext = {
  device: {
    hasSupportForWebAuthn: boolean;
    type: string;
  };
  authToken?: string;
};

export enum Events {
  livenessRegisterStarted = 'livenessRegisterStarted',
  biometricRegisterSucceeded = 'biometricRegisterSucceeded',
  biometricRegisterFailed = 'biometricRegisterFailed',
  captchaRegisterSucceeded = 'captchaRegisterSucceeded',
  qrRegisterSucceeded = 'qrRegisterSucceeded',
}

export type MachineEvents =
  | { type: Events.livenessRegisterStarted }
  | { type: Events.biometricRegisterSucceeded }
  | { type: Events.biometricRegisterFailed }
  | { type: Events.qrRegisterSucceeded }
  | { type: Events.captchaRegisterSucceeded }
  | { type: Events.biometricRegisterSucceeded };
