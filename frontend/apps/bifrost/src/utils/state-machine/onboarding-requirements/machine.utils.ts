import { DeviceInfo } from '@onefootprint/hooks';
import {
  CollectedDataOption,
  OnboardingRequirements,
} from '@onefootprint/types';

import { MachineContext } from './types';

export const shouldRunCollectKycDataFromContext = (context: MachineContext) => {
  const { missingKycData } = context;
  return shouldRunCollectKycData(missingKycData);
};

export const shouldRunCollectKycData = (
  missingKycData: readonly CollectedDataOption[],
) => missingKycData.length > 0;

export const shouldRunWebauthnFromContext = (context: MachineContext) => {
  const {
    missingLiveness,
    device: { type, hasSupportForWebauthn },
  } = context;
  return missingLiveness && type === 'mobile' && hasSupportForWebauthn;
};

export const shouldRunWebauthn = (
  requirements: OnboardingRequirements[],
  device: DeviceInfo,
) =>
  requirements.includes(OnboardingRequirements.liveness) &&
  device.type === 'mobile' &&
  device.hasSupportForWebauthn;

export const shouldRunIdScanFromContext = (context: MachineContext) => {
  const {
    missingIdDocument,
    device: { type },
  } = context;
  return missingIdDocument && type === 'mobile';
};

export const shouldRunIdScan = (
  requirements: OnboardingRequirements[],
  device: DeviceInfo,
) =>
  requirements.includes(OnboardingRequirements.collectDocument) &&
  device.type === 'mobile';

export const shouldRunD2PFromContext = (context: MachineContext) => {
  const {
    missingIdDocument,
    missingLiveness,
    device: { type },
  } = context;
  return (missingIdDocument || missingLiveness) && type !== 'mobile';
};

export const shouldRunD2P = (
  requirements: OnboardingRequirements[],
  device: DeviceInfo,
) =>
  (requirements.includes(OnboardingRequirements.collectDocument) ||
    requirements.includes(OnboardingRequirements.liveness)) &&
  device.type !== 'mobile';

export const requiresAdditionalInfo = (
  userFound: boolean,
  requirements: OnboardingRequirements[],
) =>
  userFound &&
  (requirements.includes(OnboardingRequirements.collectKycData) ||
    requirements.includes(OnboardingRequirements.collectDocument));
