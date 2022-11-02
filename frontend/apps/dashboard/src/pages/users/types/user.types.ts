import { OnboardingStatus, ScopedUser } from '@onefootprint/types';

import { UserVaultData } from './vault-data.types';

export type User = ScopedUser & {
  status: OnboardingStatus;
  vaultData: UserVaultData;
};
