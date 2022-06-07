import { useMemo } from 'react';

import { DecryptedUserAttributes } from './use-decrypt-user';
import { Onboarding, OnboardingStatus } from './use-get-onboardings';

export type User = {
  footprintUserId: string;
  status: OnboardingStatus;
  initiatedAt: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  ssn?: string;
  dob?: string;
  streetAddress?: string;
  streetAddress2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
};

type DecryptedUsersMap = Omit<
  Map<String, DecryptedUserAttributes>,
  'set' | 'clear' | 'delete'
>;

const useJoinUsers = (
  onboardings: Onboarding[] | undefined,
  decryptedUsers: DecryptedUsersMap,
) =>
  useMemo<User[] | undefined>(
    () =>
      onboardings?.map((onboarding: Onboarding) => {
        const decryptedUserData = decryptedUsers.get(
          onboarding.footprintUserId,
        );
        const name =
          decryptedUserData?.firstName && decryptedUserData?.lastName
            ? `${decryptedUserData?.firstName} ${decryptedUserData?.lastName}`
            : undefined;
        return {
          ...decryptedUserData,
          footprintUserId: onboarding.footprintUserId,
          status: onboarding.status,
          initiatedAt: onboarding.createdAt,
          name,
        };
      }),
    [decryptedUsers, onboardings],
  );

export default useJoinUsers;
