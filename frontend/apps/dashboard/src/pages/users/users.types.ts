import {
  DecryptedIdDoc,
  IdDocType,
  OnboardingStatus,
  ScopedUser,
  UserDataAttribute,
} from '@onefootprint/types';

export type User = ScopedUser & {
  requiresManualReview: boolean;
  status: OnboardingStatus;
};

export type UserVaultData = {
  kycData: Partial<Record<UserDataAttribute, KycDataValue>>;
  idDoc: Partial<Record<IdDocType, IdDocDataValue>>;
};

export type UserWithVaultData = User & { vaultData: UserVaultData };

export type KycDataValue = string | null; // Null value means encrypted
export type IdDocDataValue = DecryptedIdDoc[] | null;
