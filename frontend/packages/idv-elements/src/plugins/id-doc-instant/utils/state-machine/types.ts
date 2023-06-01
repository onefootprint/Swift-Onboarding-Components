import { DeviceInfo } from '@onefootprint/hooks';
import {
  CountryCode,
  IdDocImageError,
  IdDocRequirement,
  IdDocType,
} from '@onefootprint/types';

import { ImageTypes } from '../../constants/image-types';

export type MachineContext = {
  authToken: string;
  device: DeviceInfo;
  requirement: IdDocRequirement;
  image?: string;
  currSide?: ImageTypes;
  idDoc: {
    type?: IdDocType;
    country?: CountryCode;
  };
  errors?: IdDocImageError[];
};

export type ProccessingSucceededEvent = {
  type: 'processingSucceeded';
  payload: {
    nextSideToCollect?: string;
  };
};

export type MachineEvents =
  | {
      type: 'receivedCountryAndType';
      payload: {
        type?: IdDocType;
        country?: CountryCode;
      };
    }
  | {
      type: 'receivedImage';
      payload: {
        image: string;
      };
    }
  | {
      type: 'nextSide';
      payload: {
        nextSideToCollect: string;
      };
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
    }
  | ProccessingSucceededEvent;
