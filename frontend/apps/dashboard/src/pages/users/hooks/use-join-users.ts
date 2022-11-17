import { OnboardingStatus, ScopedUser } from '@onefootprint/types';
import { useMemo } from 'react';

import { User } from '../types/user.types';
import { UserVaultData } from '../types/vault-data.types';

type DecryptedUsersMap = Omit<
  Map<String, UserVaultData>,
  'set' | 'clear' | 'delete'
>;

const useJoinUsers = (
  scopedUsers: ScopedUser[] | undefined,
  decryptedUsers: DecryptedUsersMap,
) =>
  useMemo<User[] | undefined>(
    () =>
      scopedUsers?.map((scopedUser: ScopedUser) => {
        // Copy over the decrypted values, for remaining encrypted identityDataAttributes, add null entries
        const vaultData = decryptedUsers.get(scopedUser.id) || {
          kycData: {},
        };
        scopedUser.identityDataAttributes.forEach(attr => {
          const decryptedVal = vaultData.kycData[attr];
          if (typeof decryptedVal !== 'string') {
            vaultData.kycData[attr] = null;
          }
        });

        return {
          requiresManualReview:
            scopedUser.onboarding?.requiresManualReview || false,
          status: scopedUser.onboarding?.status || OnboardingStatus.vaultOnly,
          vaultData,
          ...scopedUser,
        } as User;
      }),
    [decryptedUsers, scopedUsers],
  );

export default useJoinUsers;
