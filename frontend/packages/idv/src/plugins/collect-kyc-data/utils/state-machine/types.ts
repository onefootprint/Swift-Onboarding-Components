import type { AuthMethodKind, CollectKycDataRequirement, PublicOnboardingConfig } from '@onefootprint/types';
import type { StateValue } from 'xstate';

import type { DeviceInfo } from '../../../../hooks';
import type { KycData } from '../data-types';

export type MachineContext = {
  // Plugin context
  authToken: string;
  device: DeviceInfo;
  config: PublicOnboardingConfig;
  requirement: CollectKycDataRequirement;
  dataCollectionScreensToShow: StateValue[];
  // Machine-generated
  data: KycData; // combines bootstrapData, disabledFields and fieldsToDecrypt after decrypting the values
  readonly initialData: Readonly<KycData>; // Snapshotted before we start collecting data to know what data we started with
};

export type MachineEvents =
  | { type: 'addVerification'; payload: `${AuthMethodKind}` }
  | { type: 'confirmed' }
  | { type: 'dataSubmitted'; payload: KycData }
  | { type: 'decryptedData'; payload: KycData }
  | { type: 'editAddress' }
  | { type: 'editBasicInfo' }
  | { type: 'editEmail' }
  | { type: 'editIdentity' }
  | { type: 'editUsLegalStatus' }
  | { type: 'initialized'; payload: KycData }
  | { type: 'navigatedToPrevPage' }
  | { type: 'returnToSummary' }
  | { type: 'stepUpCompleted'; payload: { authToken: string } };
