import { DeviceInfo } from 'hooks';

export enum States {
  init = 'Init',
  newTabRequest = 'newTabRequest',
  newTabProcessing = 'newTabProcessing',
  qrRegister = 'qrRegister',
  qrCodeScanned = 'qrCodeScanned',
  qrCodeSent = 'qrCodeSent',
  livenessCheckSucceeded = 'livenessCheckSucceeded',
  livenessCheckFailed = 'livenessCheckFailed',
}

export enum Events {
  deviceInfoIdentified = 'deviceInfoIdentified',
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
  assignDeviceInfo = 'assignDeviceInfo',
  assignScopedAuthToken = 'assignScopedAuthToken',
  clearScopedAuthToken = 'clearScopedAuthToken',
}

export type MachineContext = {
  device?: {
    hasSupportForWebAuthn: boolean;
    type: string;
  };
  scopedAuthToken?: string;
  tab?: Window;
};

export type MachineEvents =
  | {
      type: Events.deviceInfoIdentified;
      payload: DeviceInfo;
    }
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
