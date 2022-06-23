export enum States {
  init = 'init',
  newTabRequest = 'newTabRequest',
  newTabProcessing = 'newTabProcessing',
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
  tab?: Window;
};

export enum Events {
  livenessRegisterStarted = 'livenessRegisterStarted',
  scopedAuthTokenGenerated = 'scopedAuthTokenGenerated',

  // Desktop to phone verification
  qrCodeLinkSentViaSms = 'qrCodeLinkSentViaSms',
  qrCodeScanned = 'qrCodeScanned',
  qrCodeCanceled = 'qrCodeCanceled',
  qrRegisterSucceeded = 'qrRegisterSucceeded',
  qrRegisterFailed = 'qrRegisterFailed',

  // New tab verification
  newTabOpened = 'newTabOpened',
  newTabRegisterSucceeded = 'newTabRegisterSucceeded',
  newTabRegisterFailed = 'newTabRegisterFailed',
  newTabRegisterCanceled = 'newTabRegisterCanceled',

  statusPollingErrored = 'statusPollingErrored',
}

export enum Actions {
  assignTab = 'assignTab',
  clearTab = 'clearTab',
  assignScopedAuthToken = 'assignScopedAuthToken',
  clearScopedAuthToken = 'clearScopedAuthToken',
}

export type MachineEvents =
  | { type: Events.livenessRegisterStarted }
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
  | {
      type: Events.newTabOpened;
      payload: {
        tab: Window;
      };
    }
  | { type: Events.newTabRegisterFailed }
  | { type: Events.newTabRegisterSucceeded }
  | { type: Events.newTabRegisterCanceled };
