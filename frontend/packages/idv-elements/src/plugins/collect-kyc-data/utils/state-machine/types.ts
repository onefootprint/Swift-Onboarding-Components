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
  initData: KycData;
  // Machine generated
  data: KycData; // combines bootstrapData, disabledFields and fieldsToDecrypt after decrypting the values
};

export type MachineEvents =
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
