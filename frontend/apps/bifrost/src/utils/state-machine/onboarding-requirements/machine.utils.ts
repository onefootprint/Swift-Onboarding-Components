import { DeviceInfo } from '@onefootprint/hooks';
import { CollectedDataOption } from '@onefootprint/types';

import { MachineContext } from './types';

export const shouldRunCollectKycDataFromContext = (context: MachineContext) => {
  const { missingKycData } = context;
  return shouldRunCollectKycData(missingKycData);
};

export const shouldRunCollectKycData = (
  missingKycData: readonly CollectedDataOption[],
) => missingKycData.length > 0;

export const shouldRunWebauthnFromContext = (context: MachineContext) => {
  const { missingLiveness, device } = context;
  return shouldRunWebauthn(missingLiveness, device);
};

export const shouldRunWebauthn = (
  missingLiveness: boolean,
  device: DeviceInfo,
) =>
  missingLiveness && device.type === 'mobile' && device.hasSupportForWebauthn;

export const shouldRunIdScanFromContext = (context: MachineContext) => {
  const { missingIdDocument, device } = context;
  return shouldRunIdScan(missingIdDocument, device);
};

export const shouldRunIdScan = (
  missingIdDocument: boolean,
  device: DeviceInfo,
) => missingIdDocument && device.type === 'mobile';

export const shouldRunD2PFromContext = (context: MachineContext) => {
  const { missingIdDocument, missingLiveness, device } = context;
  return shouldRunD2P(missingIdDocument, missingLiveness, device);
};

export const shouldRunD2P = (
  missingIdDocument: boolean,
  missingLiveness: boolean,
  device: DeviceInfo,
) => (missingIdDocument || missingLiveness) && device.type !== 'mobile';

export const requiresAdditionalInfo = (
  userFound: boolean,
  missingKycData: readonly CollectedDataOption[],
  missingIdDocument: boolean,
) => userFound && (missingKycData.length > 0 || missingIdDocument);
