import { DeviceInfo } from '@onefootprint/hooks';
import {
  CountryCode3,
  IdDocBadImageError,
  IdDocType,
  TenantInfo,
} from '@onefootprint/types';

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
  imageErrored = 'imageErrored',
  retryLimitExceeded = 'retryLimitExceeded',
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
  tenant?: TenantInfo;
  documentRequestId?: string;
  // Machine generated
  type?: IdDocType;
  country?: CountryCode3;
  frontImage?: string; // Base64 encoded
  backImage?: string; // Base64 encoded
  frontImageError?: IdDocBadImageError;
  backImageError?: IdDocBadImageError;
};

export type MachineEvents =
  | {
      type: Events.receivedContext;
      payload: {
        authToken: string;
        device: DeviceInfo;
        tenant: TenantInfo;
        documentRequestId: string;
      };
    }
  | {
      type: Events.idCountryAndTypeSelected;
      payload: {
        type: IdDocType;
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
  | { type: Events.retryLimitExceeded }
  | {
      type: Events.imageErrored;
      payload: {
        frontImageError?: IdDocBadImageError;
        backImageError?: IdDocBadImageError;
      };
    };
