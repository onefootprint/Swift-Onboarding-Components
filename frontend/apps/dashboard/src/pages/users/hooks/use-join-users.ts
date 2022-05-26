import { useMemo } from 'react';

import { DecryptedUserAttributes } from './use-decrypt-user';
import { Onboarding, OnboardingStatus } from './use-get-onboardings';

export type User = {
  footprintUserId: string;
  status: OnboardingStatus;
  initiatedAt: string;
  name?: string;
  email?: string;
  ssn?: string;
  phoneNumber?: string;
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
          footprintUserId: onboarding.footprintUserId,
          status: onboarding.status,
          initiatedAt: onboarding.createdAt,
          name,
          email: decryptedUserData?.email,
          phoneNumber: decryptedUserData?.phoneNumber,
          ssn: decryptedUserData?.ssn,
        };
      }),
    [decryptedUsers, onboardings],
  );

export default useJoinUsers;
