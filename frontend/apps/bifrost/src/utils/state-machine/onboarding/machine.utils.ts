import { MachineContext } from './types';

export const shouldRunCollectKycData = (context: MachineContext) => {
  const { missingAttributes } = context;
  return missingAttributes.length > 0;
};

export const shouldRunWebauthn = (context: MachineContext) => {
  const {
    missingWebauthnCredentials,
    device: { type, hasSupportForWebauthn },
  } = context;
  return (
    missingWebauthnCredentials && type === 'mobile' && hasSupportForWebauthn
  );
};

export const shouldRunIdScan = (context: MachineContext) => {
  const {
    missingIdScan,
    device: { type },
  } = context;
  return missingIdScan && type === 'mobile';
};

export const shouldRunD2P = (context: MachineContext) => {
  const {
    missingIdScan,
    missingWebauthnCredentials,
    device: { type },
  } = context;
  return (missingIdScan || missingWebauthnCredentials) && type !== 'mobile';
};

export const requiresAdditionalInfo = (context: MachineContext) => {
  const { missingAttributes, userFound, missingIdScan } = context;
  return userFound && (missingAttributes.length > 0 || missingIdScan);
};
