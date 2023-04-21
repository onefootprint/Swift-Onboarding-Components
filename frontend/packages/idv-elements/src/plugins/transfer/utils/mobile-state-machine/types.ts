import { DeviceInfo } from '@onefootprint/hooks';

export type MachineContext = {
  device: DeviceInfo;
  authToken: string;
  scopedAuthToken: string;
  tab?: Window;
};

export type MachineEvents =
  | {
      type: 'receivedContext';
      payload: {
        device: DeviceInfo;
        authToken: string;
      };
    }
  | {
      type: 'scopedAuthTokenGenerated';
      payload: {
        scopedAuthToken: string;
      };
    }
  | { type: 'statusPollingErrored' }
  | {
      type: 'newTabOpened';
      payload: {
        tab: Window;
      };
    }
  | { type: 'newTabRegisterFailed' }
  | { type: 'livenessSkipped' }
  | { type: 'newTabRegisterSucceeded' }
  | { type: 'newTabRegisterCanceled' };
