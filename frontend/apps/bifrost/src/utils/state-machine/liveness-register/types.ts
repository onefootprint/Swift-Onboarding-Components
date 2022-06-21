export enum States {
  init = 'init',
  biometricRegister = 'biometricRegister',
  biometricRegisterFailure = 'biometricRegisterFailure',
  captchaRegister = 'captchaRegister',
  qrRegister = 'qrRegister',
  qrCodeScanned = 'qrCodeScanned',
  qrCodeSent = 'qrCodeSent',
  livenessRegisterSucceeded = 'livenessRegisterSucceeded',
  livenessRegisterFailed = 'livenessRegisterFailed',
}

export type MachineContext = {
  device: {
    hasSupportForWebAuthn: boolean;
    type: string;
  };
  authToken?: string;
  scopedAuthToken?: string;
};

export enum Events {
  livenessRegisterStarted = 'livenessRegisterStarted',
  biometricRegisterSucceeded = 'biometricRegisterSucceeded',
  biometricRegisterFailed = 'biometricRegisterFailed',
  captchaRegisterSucceeded = 'captchaRegisterSucceeded',
  scopedAuthTokenGenerated = 'scopedAuthTokenGenerated',
  qrCodeLinkSentViaSms = 'qrCodeLinkSentViaSms',
  qrCodeScanned = 'qrCodeScanned',
  qrCodeCanceled = 'qrCodeCanceled',
  qrRegisterSucceeded = 'qrRegisterSucceeded',
  qrRegisterFailed = 'qrRegisterFailed',
  statusPollingErrored = 'statusPollingErrored',
}

export enum Actions {
  assignScopedAuthToken = 'assignScopedAuthToken',
  clearScopedAuthToken = 'clearScopedAuthToken',
}

export type MachineEvents =
  | { type: Events.livenessRegisterStarted }
  | { type: Events.biometricRegisterSucceeded }
  | { type: Events.biometricRegisterFailed }
  | {
      type: Events.scopedAuthTokenGenerated;
      payload: {
        scopedAuthToken: string;
      };
    }
  | { type: Events.qrCodeCanceled }
  | { type: Events.qrCodeLinkSentViaSms }
  | { type: Events.qrCodeScanned }
  | { type: Events.qrRegisterSucceeded }
  | { type: Events.qrRegisterFailed }
  | { type: Events.statusPollingErrored }
  | { type: Events.captchaRegisterSucceeded }
  | { type: Events.biometricRegisterSucceeded };
