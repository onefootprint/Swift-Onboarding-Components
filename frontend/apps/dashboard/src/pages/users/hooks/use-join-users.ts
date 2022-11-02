import { OnboardingStatus, ScopedUser } from '@onefootprint/types';
import { useMemo } from 'react';
import { statusToPriority } from 'src/constants/onboarding-status-display';

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
        // The status we display for the user is the maximum status of all the onboardings
        const maxStatus = scopedUser.onboardings.sort(
          (a, b) => statusToPriority[b.status] - statusToPriority[a.status],
        )[0]?.status;

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
          status: maxStatus || OnboardingStatus.vaultOnly,
          vaultData,
          ...scopedUser,
        } as User;
      }),
    [decryptedUsers, scopedUsers],
  );

export default useJoinUsers;
