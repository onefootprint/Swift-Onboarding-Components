import { OnboardingStatus, ScopedUser } from '@onefootprint/types';
import { UserVaultData } from 'src/hooks/use-user-store';

export type User = ScopedUser & {
  requiresManualReview: boolean;
  status: OnboardingStatus;
  vaultData: UserVaultData;
};
