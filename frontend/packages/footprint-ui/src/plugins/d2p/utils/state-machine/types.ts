import { DeviceInfo } from '@onefootprint/hooks';
import { TenantInfo } from '@onefootprint/types';

import { HandoffRequirements } from '../../d2p.types';

export enum States {
  init = 'init',
  deviceSupport = 'deviceSupport',
  qrRegister = 'qrRegister',
  qrCodeScanned = 'qrCodeScanned',
  qrCodeSent = 'qrCodeSent',
  success = 'success',
  failure = 'failure',
}

export enum Events {
  receivedContext = 'receivedContext',
  scopedAuthTokenGenerated = 'scopedAuthTokenGenerated',
  qrCodeLinkSentViaSms = 'qrCodeLinkSentViaSms',
  qrCodeScanned = 'qrCodeScanned',
  qrCodeCanceled = 'qrCodeCanceled',
  qrRegisterSucceeded = 'qrRegisterSucceeded',
  qrRegisterFailed = 'qrRegisterFailed',
  statusPollingErrored = 'statusPollingErrored',
}

export enum Actions {
  assignContext = 'assignContext',
  assignScopedAuthToken = 'assignScopedAuthToken',
  clearScopedAuthToken = 'clearScopedAuthToken',
}

export type MachineContext = {
  // Plugin context
  authToken?: string;
  scopedAuthToken?: string;
  tenant?: TenantInfo;
  device?: DeviceInfo;
  missingRequirements: HandoffRequirements;
};

export type MachineEvents =
  | {
      type: Events.receivedContext;
      payload: {
        authToken: string;
        device: DeviceInfo;
        tenant: TenantInfo;
        missingRequirements: HandoffRequirements;
      };
    }
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
  | { type: Events.statusPollingErrored };
