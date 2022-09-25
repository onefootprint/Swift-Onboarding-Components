import { DeviceInfo } from '@onefootprint/hooks';
import { IdScanBadImageError, IdScanDocType } from '@onefootprint/types';

export enum States {
  init = 'init',
  idCountryAndTypeSelection = 'idCountryAndTypeSelection',
  takeOrUploadFrontPhoto = 'takeOrUploadFrontPhoto',
  takeOrUploadBackPhoto = 'takeOrUploadBackPhoto',
  processingPhoto = 'processingPhoto',
  retryFrontPhoto = 'retryFrontPhoto',
  retryBackPhoto = 'retryBackPhoto',
  success = 'success',
  failure = 'failure',
}

export enum Events {
  receivedContext = 'receivedContext',
  idCountryAndTypeSelected = 'idCountryAndTypeSelected',
  receivedFrontImage = 'receivedFrontImage',
  receivedBackImage = 'receivedBackImage',
  imageSucceeded = 'imageSucceeded',
  imageFailed = 'imageFailed',
}

export enum Actions {
  assignContext = 'assignContext',
  assignIdCountryAndType = 'assignIdCountryAndType',
  assignFrontImage = 'assignFrontImage',
  assignBackImage = 'assignBackImage',
  assignImageErrors = 'assignImageErrors',
}

export type MachineContext = {
  // Plugin context
  authToken?: string;
  device?: DeviceInfo;
  // Machine generated
  type?: IdScanDocType;
  country?: string; // TODO: replace with 3 char country alpha code
  frontImage?: string; // Base64 encoded
  backImage?: string; // Base64 encoded
  frontImageError?: IdScanBadImageError;
  backImageError?: IdScanBadImageError;
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
    }
  | {
      type: Events.receivedFrontImage;
      payload: {
        image: string;
      };
    }
  | {
      type: Events.receivedBackImage;
      payload: {
        image: string;
      };
    }
  | {
      type: Events.imageSucceeded;
    }
  | {
      type: Events.imageFailed;
      payload: {
        frontImageError?: IdScanBadImageError;
        backImageError?: IdScanBadImageError;
      };
    };
