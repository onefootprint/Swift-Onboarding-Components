import { DeviceInfo } from '@onefootprint/hooks';
import { CollectedKycDataOption } from '@onefootprint/types';

import { MachineContext } from './types';

export const shouldRunCollectKycDataFromContext = (context: MachineContext) => {
  const { missingKycData } = context;
  return shouldRunCollectKycData(missingKycData);
};

export const shouldRunCollectKycData = (
  missingKycData?: readonly CollectedKycDataOption[],
) => typeof missingKycData !== 'undefined';

export const shouldRunIdScanFromContext = (context: MachineContext) => {
  const { missingIdDocument, device } = context;
  return shouldRunIdScan(missingIdDocument, device);
};

export const shouldRunIdScan = (
  missingIdDocument: boolean,
  device: DeviceInfo,
) => missingIdDocument && device.type === 'mobile';

export const shouldRunTransferFromContext = (context: MachineContext) => {
  const { missingIdDocument, missingLiveness, device } = context;
  return shouldRunTransfer(missingIdDocument, missingLiveness, device);
};

export const shouldRunTransfer = (
  missingIdDocument: boolean,
  missingLiveness: boolean,
  device: DeviceInfo,
) => {
  if (device.type === 'mobile') {
    return missingLiveness;
  }
  return missingIdDocument || missingLiveness;
};

export const requiresAdditionalInfo = (
  userFound: boolean,
  missingIdDocument: boolean,
  missingKycData?: readonly CollectedKycDataOption[],
) => userFound && (!!missingKycData?.length || missingIdDocument);
