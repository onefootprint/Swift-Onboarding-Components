import type {
  CountryCode,
  DocumentRequirement,
  IdDocImageProcessingError,
  IdDocImageTypes,
  IdDocImageUploadError,
  IdDocOutcome,
  IdDocRequirementConfig,
  SupportedIdDocTypes,
} from '@onefootprint/types';

import type { DeviceInfo } from '../../../../../hooks';
import type { IdDocImageErrorType, ReceivedImagePayload } from '../../../types';

export type MachineContext = {
  authToken: string;
  cameraPermissionState: PermissionState;
  device: DeviceInfo;
  orgId: string;
  requirement: DocumentRequirement<IdDocRequirementConfig>;
  isConsentMissing: boolean;
  image?: ReceivedImagePayload;
  currSide?: IdDocImageTypes;
  idDoc: {
    type?: `${SupportedIdDocTypes}`;
    country?: CountryCode;
  };
  id?: string;
  errors?: IdDocImageErrorType[];
  sandboxOutcome?: IdDocOutcome;
  hasBadConnectivity?: boolean;
  forceUpload?: boolean;
};

export type ProcessingSucceededEvent = {
  type: 'processingSucceeded';
  payload: { nextSideToCollect?: string };
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
  | { type: 'receivedCountryAndType'; payload: { type?: `${SupportedIdDocTypes}`; country?: CountryCode; id: string } }
  | { type: 'receivedImage'; payload: ReceivedImagePayload }
  | { type: 'retryLimitExceeded' }
  | { type: 'startImageCapture' }
  | { type: 'uploadErrored'; payload: { errors: { errorType: IdDocImageUploadError; errorInfo?: string }[] } }
  | ProcessingSucceededEvent;
