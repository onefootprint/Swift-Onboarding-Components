import { DeviceInfo } from '@onefootprint/hooks';
import { IdScanBadImageError, IdScanDocType } from '@onefootprint/types';
import { CountryCode3 } from '@onefootprint/types/src/data/countries';

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
  documentRequestId?: string;
  // Machine generated
  type?: IdScanDocType;
  country?: CountryCode3;
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
        documentRequestId: string;
      };
    }
  | {
      type: Events.idCountryAndTypeSelected;
      payload: {
        type: IdScanDocType;
        country: CountryCode3;
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
