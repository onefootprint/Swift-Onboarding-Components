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
  | {
      type: 'contextInitialized';
      payload: {
        id: string;
      };
    }
  | {
      type: 'contextInitializationFailed';
    }
  | {
      type: 'receivedDocument';
      payload: {
        imageFile: File | Blob;
        captureKind: CaptureKind;
        extraCompressed?: boolean;
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
  | {
      type: 'cameraStuck';
    }
  | {
      type: 'processingSucceeded';
    }
  | { type: 'navigatedToPrev' }
  | {
      type: 'navigatedToPrompt';
    };
