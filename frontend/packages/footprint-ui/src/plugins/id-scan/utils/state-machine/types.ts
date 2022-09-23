import { DeviceInfo } from 'hooks';
import { IdScanBadImageError, IdScanDocType } from 'types';

export enum States {
  init = 'init',
  idCountryAndTypeSelection = 'idCountryAndTypeSelection',
  success = 'success',
}

export enum Events {
  receivedContext = 'receivedContext',
  idCountryAndTypeSelected = 'idCountryAndTypeSelected',
}

export enum Actions {
  assignContext = 'assignContext',
  assignIdCountryAndType = 'assignIdCountryAndType',
}

export type MachineContext = {
  // Plugin context
  authToken?: string;
  device?: DeviceInfo;
  // Machine generated
  type?: IdScanDocType;
  country?: string; // TODO: replace with 3 char country alpha code
  image?: string; // Base64 encoded
  error?: IdScanBadImageError;
  retryCount: number;
};

export type MachineEvents =
  | {
      type: Events.receivedContext;
      payload: {
        authToken: string;
        device: DeviceInfo;
      };
    }
  | {
      type: Events.idCountryAndTypeSelected;
      payload: {
        type: IdScanDocType;
        country: string; // TODO: replace with 3 char country alpha code
      };
    };
