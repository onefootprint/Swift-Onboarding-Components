import type {
  DocumentUploadMode,
  IdDocOutcome,
  IdDocRequirementConfig,
} from '@onefootprint/types';

import type { DeviceInfo } from '../../../hooks';

export type InitialContext = {
  sandboxOutcome?: IdDocOutcome;
  authToken: string;
  device: DeviceInfo;
  orgId: string;
  documentRequestId: string;
  uploadMode: DocumentUploadMode;
  config: IdDocRequirementConfig;
};

export type IdDocProps = {
  initialContext: InitialContext;
  onDone: () => void;
};
