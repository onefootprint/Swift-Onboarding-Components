import { DeviceInfo } from '@onefootprint/hooks';
import { TenantInfo } from '@onefootprint/types';

export enum States {
  init = 'init',
  deviceSupport = 'deviceSupport',
  newTabRequest = 'newTabRequest',
  newTabProcessing = 'newTabProcessing',
  skipLiveness = 'skipLiveness',
  success = 'success',
  failure = 'failure',
}

export type MachineContext = {
  device: DeviceInfo;
  authToken: string;
  scopedAuthToken: string;
  tenant?: TenantInfo;
  tab?: Window;
};

export enum Events {
  receivedContext = 'receivedContext',
  scopedAuthTokenGenerated = 'scopedAuthTokenGenerated',
  newTabOpened = 'newTabOpened',
  newTabRegisterSucceeded = 'newTabRegisterSucceeded',
  newTabRegisterFailed = 'newTabRegisterFailed',
  newTabRegisterCanceled = 'newTabRegisterCanceled',
  statusPollingErrored = 'statusPollingErrored',
  livenessSkipped = 'livenessSkipped',
}

export enum Actions {
  assignInitialContext = 'assignInitialContext',
  assignTab = 'assignTab',
  clearTab = 'clearTab',
  assignScopedAuthToken = 'assignScopedAuthToken',
  clearScopedAuthToken = 'clearScopedAuthToken',
}

export type MachineEvents =
  | {
      type: Events.receivedContext;
      payload: {
        device: DeviceInfo;
        authToken: string;
        tenant: TenantInfo;
      };
    }
  | {
      type: Events.scopedAuthTokenGenerated;
      payload: {
        scopedAuthToken: string;
      };
    }
  | { type: Events.statusPollingErrored }
  | {
      type: Events.newTabOpened;
      payload: {
        tab: Window;
      };
    }
  | { type: Events.newTabRegisterFailed }
  | { type: Events.livenessSkipped }
  | { type: Events.newTabRegisterSucceeded }
  | { type: Events.newTabRegisterCanceled };
