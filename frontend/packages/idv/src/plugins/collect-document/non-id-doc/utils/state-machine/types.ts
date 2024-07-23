import type {
  CountryCode,
  DocumentRequirementConfig,
  DocumentUploadMode,
  IdDocImageProcessingError,
  IdDocImageUploadError,
} from '@onefootprint/types';

import type { DeviceInfo } from '../../../../../hooks/ui/use-device-info';
import type { CaptureKind, IdDocImageErrorType } from '../../../types';

export type MachineContext = {
  authToken: string;
  cameraPermissionState?: PermissionState;
  device: DeviceInfo;
  orgId: string;
  documentRequestId: string;
  config: DocumentRequirementConfig;
  uploadMode: DocumentUploadMode;
  document?: {
    imageFile: File | Blob;
    captureKind: CaptureKind;
    extraCompressed?: boolean;
  };
  id?: string;
  errors?: IdDocImageErrorType[];
  hasBadConnectivity?: boolean;
  obConfigSupportedCountries?: CountryCode[];
};

export type MachineEvents =
  | { type: 'cameraAccessDenied'; payload: { status: PermissionState } }
  | { type: 'cameraAccessGranted'; payload: { status: PermissionState; stream: MediaStream } }
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
  | {
      type: 'receivedDocument';
      payload: { imageFile: File | Blob; captureKind: CaptureKind; extraCompressed?: boolean };
    }
  | { type: 'retryLimitExceeded' }
  | { type: 'startImageCapture' }
  | { type: 'uploadErrored'; payload: { errors: { errorType: IdDocImageUploadError; errorInfo?: string }[] } };
