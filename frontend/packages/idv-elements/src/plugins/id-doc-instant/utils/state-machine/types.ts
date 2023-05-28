import { DeviceInfo } from '@onefootprint/hooks';
import {
  CountryCode3,
  IdDocImageError,
  IdDocRequirement,
  IdDocType,
} from '@onefootprint/types';

export type MachineContext = {
  authToken: string;
  device: DeviceInfo;
  requirement: IdDocRequirement;
  image?: string;
  idDoc: {
    type?: IdDocType;
    country?: CountryCode3;
  };
  selfie: {
    consentRequired?: boolean;
    required?: boolean;
  };
  errors?: IdDocImageError[];
};

export type MachineEvents =
  | {
      type: 'receivedCountryAndType';
      payload: {
        type?: IdDocType;
        country?: CountryCode3;
      };
    }
  | {
      type: 'receivedImage';
      payload: {
        image: string;
      };
    }
  | {
      type: 'processingSucceeded';
    }
  | {
      type: 'processingErrored';
      payload: {
        errors: IdDocImageError[];
      };
    }
  | {
      type: 'consentReceived';
    }
  | {
      type: 'startSelfieCapture';
    }
  | {
      type: 'cameraErrored';
    }
  | {
      type: 'navigatedToPrev';
    };
