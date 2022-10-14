import {
  OnboardingStatus,
  ScopedUser,
  UserDataAttribute,
  UserDataAttributeKey,
  UserDataAttributeKeys,
} from '@onefootprint/types';
import { useMemo } from 'react';
import { statusToPriority } from 'src/constants/onboarding-status-display';

import { UserAttributes, UserData } from './use-user-data';

export type User = ScopedUser & {
  status: OnboardingStatus;
  attributes: UserAttributes;
};

// Create a custom UserData for name since it's two separate attributes joined
export const nameData = (attributes: UserAttributes) =>
  ({
    value:
      attributes.firstName?.value &&
      attributes.lastName?.value &&
      `${attributes.firstName?.value} ${attributes.lastName?.value}`,
    exists: attributes.firstName?.exists && attributes.lastName?.exists,
  } as UserData);

type DecryptedUsersMap = Omit<
  Map<String, UserAttributes>,
  'set' | 'clear' | 'delete'
>;

const useJoinUsers = (
  scoped_users: ScopedUser[] | undefined,
  decryptedUsers: DecryptedUsersMap,
) =>
  useMemo<User[] | undefined>(
    () =>
      scoped_users?.map((scoped_user: ScopedUser) => {
        const decryptedData =
          decryptedUsers.get(scoped_user.footprintUserId) ||
          ({} as UserAttributes);
        // Create a UserData for every type of DataKind for this user. The UserData contains
        // the value of the attribute if decrypted, otherwise information on whether the value
        // is set for the user and whether we're currently fetching the decrypted value.
        // This object is composed by joining info from previous POST decrypt calls and
        // GET /users calls
        const attributes = Object.fromEntries(
          UserDataAttributeKeys.map(
            (userAttributeKey: UserDataAttributeKey) => [
              userAttributeKey,
              {
                value: decryptedData[userAttributeKey]?.value,
                exists:
                  decryptedData[userAttributeKey]?.exists ||
                  scoped_user.identityDataAttributes.includes(
                    UserDataAttribute[userAttributeKey],
                  ),
              } as UserData,
            ],
          ),
        );

        // The status we display for the user is the maximum status of all the onboardings
        const maxStatus = scoped_user.onboardings.sort(
          (a, b) => statusToPriority[b.status] - statusToPriority[a.status],
        )[0]?.status;

        return {
          status: maxStatus || OnboardingStatus.vaultOnly,
          attributes,
          ...scoped_user,
        } as User;
      }),
    [decryptedUsers, scoped_users],
  );

export default useJoinUsers;
