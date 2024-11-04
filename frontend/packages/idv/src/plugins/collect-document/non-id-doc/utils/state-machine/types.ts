import type {
  CountryCode,
  DocumentRequirement,
  IdDocImageProcessingError,
  IdDocImageUploadError,
} from '@onefootprint/types';

import type { DeviceInfo } from '@/idv/hooks';
import type { IdDocImageErrorType, ReceivedImagePayload } from '../../../types';

export type MachineContext = {
  authToken: string;
  cameraPermissionState?: PermissionState;
  device: DeviceInfo;
  orgId: string;
  requirement: DocumentRequirement;
  document?: ReceivedImagePayload;
  id?: string;
  errors?: IdDocImageErrorType[];
  hasBadConnectivity?: boolean;
  obConfigSupportedCountries?: CountryCode[];
};

export type MachineEvents =
  | { type: 'cameraAccessDenied'; payload: { status: PermissionState } }
  | { type: 'cameraAccessGranted'; payload: { status: PermissionState } }
  | { type: 'cameraErrored' }
  | { type: 'cameraStuck' }
  | { type: 'contextInitializationFailed' }
  | { type: 'contextInitialized'; payload: { id: string } }
  | { type: 'navigatedToCountryDoc' }
  | { type: 'navigatedToPrev' }
  | { type: 'navigatedToPrev' }
  | { type: 'navigatedToPrompt' }
  | { type: 'processingErrored'; payload: { errors: { errorType: IdDocImageProcessingError; errorInfo?: string }[] } }
  | { type: 'processingSucceeded' }
  | { type: 'receivedDocument'; payload: ReceivedImagePayload }
  | { type: 'retryLimitExceeded' }
  | { type: 'startImageCapture' }
  | { type: 'uploadErrored'; payload: { errors: { errorType: IdDocImageUploadError; errorInfo?: string }[] } };
