import { DeviceInfo } from '@onefootprint/hooks';
import {
  CountryCode3,
  IdDocBadImageError,
  IdDocType,
} from '@onefootprint/types';

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
      type: 'receivedContext';
      payload: {
        authToken: string;
        device: DeviceInfo;
        selfieRequired?: boolean;
        idDocRequired?: boolean;
        consentRequired?: boolean;
      };
    }
  | {
      type: 'idDocCountryAndTypeSelected';
      payload: {
        type: IdDocType;
        country: CountryCode3;
      };
    }
  | {
      type: 'navigatedToPrev';
    }
  | {
      type: 'cameraErrored';
    }
  | {
      type: 'receivedIdDocFrontImage';
      payload: {
        image: string;
      };
    }
  | {
      type: 'receivedIdDocBackImage';
      payload: {
        image: string;
      };
    }
  | {
      type: 'consentReceived';
    }
  | {
      type: 'startSelfieCapture';
    }
  | {
      type: 'receivedSelfieImage';
      payload: {
        image: string;
      };
    }
  | {
      type: 'succeeded';
    }
  | { type: 'retryLimitExceeded' }
  | {
      type: 'errored';
      payload: {
        errors: IdDocBadImageError[];
      };
    }
  | {
      type: 'resubmitIdDocImages';
    };
