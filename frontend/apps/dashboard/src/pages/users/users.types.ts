import {
  DecryptedIdDoc,
  IdDocType,
  InvestorProfileDataAttribute,
  ScopedUser,
  UserDataAttribute,
  UserStatus,
} from '@onefootprint/types';

export type User = ScopedUser & {
  requiresManualReview: boolean;
  status: UserStatus;
};

export type UserVaultData = {
  kycData: Partial<Record<UserDataAttribute, KycDataValue>>;
  idDoc: Partial<Record<IdDocType, IdDocDataValue>>;
  investorProfile: Partial<
    Record<InvestorProfileDataAttribute, InvestorProfileDataValue>
  >;
};

export type UserWithVaultData = User & { vaultData: UserVaultData };

// Null value means encrypted
export type KycDataValue = string | null;
export type InvestorProfileDataValue = string | null;
export type IdDocDataValue = DecryptedIdDoc[] | null;
