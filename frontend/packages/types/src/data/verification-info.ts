import { SignalAttribute } from './signal-attribute';
import { Vendor } from './vendor';

export enum VerificationInfoStatus {
  Verified = 'verified',
  Failed = 'failed',
  NotFound = 'not_found',
}

export type VerificationInfo = {
  attributes: SignalAttribute[];
  vendor: Vendor;
  status: VerificationInfoStatus;
};

export const verificationInfoStatusToDisplayName: Record<string, string> = {
  [VerificationInfoStatus.Verified]: 'verified by',
  [VerificationInfoStatus.Failed]: 'flagged by',
  [VerificationInfoStatus.NotFound]: 'unable to be located by',
};
