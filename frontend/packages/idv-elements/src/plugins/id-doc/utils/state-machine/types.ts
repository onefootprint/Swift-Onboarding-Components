import type {
  CountryCode,
  IdDocImageProcessingError,
  IdDocImageTypes,
  IdDocImageUploadError,
  IdDocOutcomes,
  IdDocRequirement,
  SupportedIdDocTypes,
} from '@onefootprint/types';

import type { DeviceInfo } from '../../../../hooks/ui/use-device-info';

export type IdDocImageErrorType = {
  errorType: IdDocImageProcessingError | IdDocImageUploadError;
  errorInfo?: string;
};

export type CaptureKind = 'auto' | 'manual';

export type MachineContext = {
  authToken: string;
  device: DeviceInfo;
  requirement: IdDocRequirement;
  image?: { imageFile: File; captureKind?: CaptureKind };
  currSide?: IdDocImageTypes;
  idDoc: {
    type?: SupportedIdDocTypes;
    country?: CountryCode;
  };
  id?: string;
  errors?: IdDocImageErrorType[];
  sandboxOutcome?: IdDocOutcomes;
  supportedCountryAndDocTypes: Partial<
    Record<CountryCode, SupportedIdDocTypes[]>
  >;
  hasBadConnectivity?: boolean;
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
        imageFile: File;
        captureKind?: CaptureKind;
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
        errors: {
          errorType: IdDocImageProcessingError;
          errorInfo?: string;
        }[];
      };
    }
  | {
      type: 'uploadErrored';
      payload: {
        errors: {
          errorType: IdDocImageUploadError;
          errorInfo?: string;
        }[];
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
  | {
      type: 'navigatedToCountryDoc';
    }
  | ProccessingSucceededEvent;
