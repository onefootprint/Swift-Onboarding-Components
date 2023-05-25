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
  type?: IdDocType;
  requirement: IdDocRequirement;
  image?: string;
  idDoc: {
    country?: CountryCode3;
  };
  selfie: {
    consentRequired?: boolean;
    required?: boolean;
  };
  error?: IdDocImageError;
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
        error: IdDocImageError;
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
