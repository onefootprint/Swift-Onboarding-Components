import type {
  CountryCode,
  DocumentUploadMode,
  IdDocImageProcessingError,
  IdDocImageTypes,
  IdDocImageUploadError,
  IdDocOutcome,
  SupportedIdDocTypes,
} from '@onefootprint/types';

import type { DeviceInfo } from '../../../../../hooks';
import type { CaptureKind, IdDocImageErrorType } from '../../../types';

export type MachineContext = {
  authToken: string;
  cameraPermissionState: PermissionState;
  device: DeviceInfo;
  orgId: string;
  documentRequestId: string;
  shouldCollectSelfie: boolean;
  isConsentMissing: boolean;
  supportedCountryAndDocTypes: Partial<Record<CountryCode, SupportedIdDocTypes[]>>;
  uploadMode: DocumentUploadMode;
  image?: {
    imageFile: File | Blob;
    captureKind: CaptureKind;
    extraCompressed?: boolean;
  };
  currSide?: IdDocImageTypes;
  idDoc: {
    type?: SupportedIdDocTypes;
    country?: CountryCode;
  };
  id?: string;
  errors?: IdDocImageErrorType[];
  sandboxOutcome?: IdDocOutcome;
  hasBadConnectivity?: boolean;
  forceUpload?: boolean;
};

export type ProccessingSucceededEvent = {
  type: 'processingSucceeded';
  payload: {
    nextSideToCollect?: string;
  };
};

export type MachineEvents =
  | { type: 'cameraAccessDenied'; payload: { status: PermissionState } }
  | { type: 'cameraAccessGranted'; payload: { status: PermissionState; stream: MediaStream } }
  | { type: 'cameraErrored' }
  | { type: 'cameraStuck' }
  | { type: 'consentReceived' }
  | { type: 'navigatedToCountryDoc' }
  | { type: 'navigatedToPrev' }
  | { type: 'nextSide'; payload: { nextSideToCollect: string } }
  | { type: 'processingErrored'; payload: { errors: { errorType: IdDocImageProcessingError; errorInfo?: string }[] } }
  | { type: 'receivedCountryAndType'; payload: { type?: SupportedIdDocTypes; country?: CountryCode; id: string } }
  | { type: 'receivedImage'; payload: { imageFile: File | Blob; captureKind: CaptureKind; extraCompressed?: boolean } }
  | { type: 'retryLimitExceeded' }
  | { type: 'startImageCapture' }
  | { type: 'uploadErrored'; payload: { errors: { errorType: IdDocImageUploadError; errorInfo?: string }[] } }
  | ProccessingSucceededEvent;
