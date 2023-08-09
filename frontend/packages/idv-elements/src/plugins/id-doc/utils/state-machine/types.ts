import {
  CountryCode,
  IdDocImageError,
  IdDocImageTypes,
  IdDocRequirement,
  SupportedIdDocTypes,
} from '@onefootprint/types';

import type { DeviceInfo } from '../../../../hooks/ui/use-device-info';

export type MachineContext = {
  authToken: string;
  device: DeviceInfo;
  requirement: IdDocRequirement;
  image?: { imageString: string; mimeType: string };
  currSide?: IdDocImageTypes;
  idDoc: {
    type?: SupportedIdDocTypes;
    country?: CountryCode;
  };
  id?: string;
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
        type?: SupportedIdDocTypes;
        country?: CountryCode;
        id: string;
      };
    }
  | {
      type: 'receivedImage';
      payload: {
        imageString: string;
        mimeType: string;
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
      type: 'startImageCapture';
    }
  | {
      type: 'cameraErrored';
    }
  | {
      type: 'navigatedToPrev';
    }
  | {
      type: 'retryLimitExceeded';
    }
  | ProccessingSucceededEvent;
