import { DeviceInfo } from '@onefootprint/hooks';
import {
  CollectKycDataRequirement,
  OnboardingConfig,
} from '@onefootprint/types';

import { KycData } from '../data-types';

export type MachineContext = {
  // Plugin context
  authToken: string;
  device: DeviceInfo;
  config: OnboardingConfig;
  userFound: boolean;
  sandboxSuffix?: string; // only if in sandbox mode
  requirement: CollectKycDataRequirement;
  // Machine-generated
  data: KycData; // combines bootstrapData, disabledFields and fieldsToDecrypt after decrypting the values
  readonly initialData: KycData; // Snapshotted before we start collecting data to know what data we started with
};

export type MachineEvents =
  | { type: 'initialized'; payload: KycData }
  | {
      type: 'dataSubmitted';
      payload: KycData;
    }
  | { type: 'navigatedToPrevPage' }
  | { type: 'confirmed' }
  | { type: 'editEmail' }
  | { type: 'editBasicInfo' }
  | { type: 'editAddress' }
  | { type: 'editIdentity' }
  | { type: 'returnToSummary' };
