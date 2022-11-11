import { OnboardingStatus, ScopedUser } from '@onefootprint/types';

import { UserVaultData } from './vault-data.types';

export type User = ScopedUser & {
  requiresManualReview: boolean;
  status: OnboardingStatus;
  vaultData: UserVaultData;
};
