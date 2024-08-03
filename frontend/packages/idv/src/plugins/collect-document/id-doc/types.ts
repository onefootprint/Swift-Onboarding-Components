import type { DocumentRequirement, IdDocOutcome, IdDocRequirementConfig } from '@onefootprint/types';

import type { DeviceInfo } from '../../../hooks';

export type InitialContext = {
  sandboxOutcome?: IdDocOutcome;
  authToken: string;
  device: DeviceInfo;
  orgId: string;
  requirement: DocumentRequirement<IdDocRequirementConfig>;
};

export type IdDocProps = {
  initialContext: InitialContext;
  onDone: () => void;
};
