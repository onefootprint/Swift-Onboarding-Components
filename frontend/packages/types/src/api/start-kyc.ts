import { KycStatus } from './get-kyc-status';

export type StartKycRequest = {
  authToken: string;
  tenantPk: string;
};

export type StartKycResponse = {
  status: KycStatus;
};
