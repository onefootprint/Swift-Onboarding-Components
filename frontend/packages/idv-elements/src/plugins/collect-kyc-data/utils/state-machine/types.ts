import { DeviceInfo } from '@onefootprint/hooks';
import {
  CollectKycDataRequirement,
  IdDI,
  IdDIData,
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
  // Machine generated
  data: KycData; // combines bootstrapData, fixedFields and fieldsToDecrypt after decrypting the values
};

export type MachineEvents =
  | {
      type: 'receivedContext';
      payload: {
        authToken: string;
        requirement: CollectKycDataRequirement;
        userFound: boolean;
        device: DeviceInfo;
        sandboxSuffix?: string;
        config: OnboardingConfig;
        bootstrapData?: IdDIData;
        fixedFields?: IdDI[];
      };
    }
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
