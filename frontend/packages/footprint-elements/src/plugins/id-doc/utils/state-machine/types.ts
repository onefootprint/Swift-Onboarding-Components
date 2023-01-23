import { DeviceInfo } from '@onefootprint/hooks';
import {
  CountryCode3,
  IdDocBadImageError,
  IdDocType,
} from '@onefootprint/types';

export enum States {
  init = 'init',
  idDocCountryAndType = 'idDocCountryAndType',
  idDocFrontImage = 'idDocFrontImage',
  idDocBackImage = 'idDocBackImage',
  selfiePrompt = 'selfiePrompt',
  selfieImage = 'selfieImage',
  processingDocuments = 'processingDocuments',
  error = 'error',
  success = 'success',
  failure = 'failure',
}

export enum Events {
  receivedContext = 'receivedContext',
  idDocCountryAndTypeSelected = 'idDocCountryAndTypeSelected',
  cameraErrored = 'cameraErrored',
  receivedIdDocFrontImage = 'receivedIdDocFrontImage',
  receivedIdDocBackImage = 'receivedIdDocBackImage',
  consentReceived = 'startSelfieCapture',
  startSelfieCapture = 'startSelfieCapture',
  receivedSelfieImage = 'receivedSelfieImage',
  succeeded = 'succeeded',
  errored = 'errored',
  retryLimitExceeded = 'retryLimitExceeded',
  resubmitIdDocImages = 'resubmitIdDocImages',
}

export enum Actions {
  assignContext = 'assignContext',
  assignIdDocCountryAndType = 'assignIdDocCountryAndType',
  assignIdDocFrontImage = 'assignIdDocFrontImage',
  assignIdDocBackImage = 'assignIdDocBackImage',
  assignIdDocImageErrors = 'assignIdDocImageErrors',
  assignConsent = 'assignConsent',
  assignSelfie = 'assignSelfie',
}

export type MachineContext = {
  authToken?: string;
  device?: DeviceInfo;
  idDoc: {
    required?: boolean;
    type?: IdDocType;
    country?: CountryCode3;
    frontImage?: string; // Base64 encoded
    backImage?: string; // Base64 encoded
    errors?: IdDocBadImageError[];
  };
  selfie: {
    consentRequired?: boolean;
    required?: boolean;
    image?: string; // Base64 encoded
  };
};

export type MachineEvents =
  | {
      type: Events.receivedContext;
      payload: {
        authToken: string;
        device: DeviceInfo;
        selfieRequired?: boolean;
        idDocRequired?: boolean;
        consentRequired?: boolean;
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
      type: Events.cameraErrored;
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
      type: Events.consentReceived;
    }
  | {
      type: Events.startSelfieCapture;
    }
  | {
      type: Events.receivedSelfieImage;
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
        errors: IdDocBadImageError[];
      };
    }
  | {
      type: Events.resubmitIdDocImages;
    };
