import { ScopedUser, UserStatus, Vault } from '@onefootprint/types';

export type User = ScopedUser & {
  requiresManualReview: boolean;
  status: UserStatus;
};

export type UserWithVaultData = User & { vault: Vault };
