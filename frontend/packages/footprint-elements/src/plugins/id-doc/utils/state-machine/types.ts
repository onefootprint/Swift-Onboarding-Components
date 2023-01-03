import { DeviceInfo } from '@onefootprint/hooks';
import {
  CountryCode3,
  IdDocBadImageError,
  IdDocType,
} from '@onefootprint/types';

export enum States {
  init = 'init',
  idDocCountryAndType = 'idDocCountryAndType',
  idDocFrontPhoto = 'idDocFrontPhoto',
  idDocBackPhoto = 'idDocBackPhoto',
  processingDocuments = 'processingDocuments',
  retryIdDocFrontPhoto = 'retryIdDocFrontPhoto',
  retryIdDocBackPhoto = 'retryIdDocBackPhoto',
  success = 'success',
  failure = 'failure',
}

export enum Events {
  receivedContext = 'receivedContext',
  idDocCountryAndTypeSelected = 'idDocCountryAndTypeSelected',
  receivedIdDocFrontImage = 'receivedIdDocFrontImage',
  receivedIdDocBackImage = 'receivedIdDocBackImage',
  succeeded = 'succeeded',
  errored = 'errored',
  retryLimitExceeded = 'retryLimitExceeded',
}

export enum Actions {
  assignContext = 'assignContext',
  assignIdDocCountryAndType = 'assignIdDocCountryAndType',
  assignIdDocFrontImage = 'assignIdDocFrontImage',
  assignIdDocBackImage = 'assignIdDocBackImage',
  assignIdDocImageErrors = 'assignIdDocImageErrors',
}

export type MachineContext = {
  authToken?: string;
  device?: DeviceInfo;
  requestId?: string;
  idDoc: {
    type?: IdDocType;
    country?: CountryCode3;
    frontImage?: string; // Base64 encoded
    backImage?: string; // Base64 encoded
    frontImageError?: IdDocBadImageError;
    backImageError?: IdDocBadImageError;
  };
  selfie: {
    image?: string; // Base64 encoded
  };
};

export type MachineEvents =
  | {
      type: Events.receivedContext;
      payload: {
        authToken: string;
        device: DeviceInfo;
        requestId?: string;
      };
    }
  | {
      type: Events.idDocCountryAndTypeSelected;
      payload: {
        type: IdDocType;
        country: CountryCode3;
      };
    }
  | {
      type: Events.receivedIdDocFrontImage;
      payload: {
        image: string;
      };
    }
  | {
      type: Events.receivedIdDocBackImage;
      payload: {
        image: string;
      };
    }
  | {
      type: Events.succeeded;
    }
  | { type: Events.retryLimitExceeded }
  | {
      type: Events.errored;
      payload: {
        idDocFrontImageError?: IdDocBadImageError;
        idDocBackImageError?: IdDocBadImageError;
      };
    };
