import { useMemo } from 'react';

import { DataKind } from './use-decrypt-user';
import { Onboarding, OnboardingStatus } from './use-get-onboardings';

export type User = {
  footprintUserId: string;
  status: OnboardingStatus;
  initiatedAt: string;
  decryptedAttributes?: DecryptedAttributes;
};

export type UserData = {
  value?: string;
  isLoading: boolean;
};

export type DecryptedAttributes = Record<keyof typeof DataKind, UserData>;

// Create a custom UserData for name since it's two separate attributes joined
export const nameData = (decryptedAttributes?: DecryptedAttributes) =>
  decryptedAttributes && {
    value:
      decryptedAttributes?.firstName?.value &&
      decryptedAttributes?.lastName?.value &&
      `${decryptedAttributes?.firstName?.value} ${decryptedAttributes?.lastName?.value}`,
    isLoading:
      decryptedAttributes?.firstName?.isLoading ||
      decryptedAttributes?.lastName?.isLoading,
  };

type DecryptedUsersMap = Omit<
  Map<String, DecryptedAttributes>,
  'set' | 'clear' | 'delete'
>;

const useJoinUsers = (
  onboardings: Onboarding[] | undefined,
  decryptedUsers: DecryptedUsersMap,
) =>
  useMemo<User[] | undefined>(
    () =>
      onboardings?.map((onboarding: Onboarding) => ({
        footprintUserId: onboarding.footprintUserId,
        status: onboarding.status,
        initiatedAt: onboarding.createdAt,
        decryptedAttributes: decryptedUsers.get(onboarding.footprintUserId),
      })),
    [decryptedUsers, onboardings],
  );

export default useJoinUsers;
