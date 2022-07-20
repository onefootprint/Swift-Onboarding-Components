import { useMemo } from 'react';
import {
  ALL_FIELDS,
  DataKind,
  DataKindType,
  Onboarding,
  OnboardingLink,
  OnboardingStatus,
  statusToPriority,
} from 'src/types';

import { UserAttributes, UserData } from './use-user-data';

export type User = {
  footprintUserId: string;
  status: OnboardingStatus;
  initiatedAt: string;
  orderingId: string;
  attributes: UserAttributes;
  onboardingLinks: OnboardingLink[];
};

// Create a custom UserData for name since it's two separate attributes joined
export const nameData = (attributes: UserAttributes) =>
  ({
    value:
      attributes.firstName?.value &&
      attributes.lastName?.value &&
      `${attributes.firstName?.value} ${attributes.lastName?.value}`,
    isLoading:
      attributes.firstName?.isLoading ||
      attributes.lastName?.isLoading ||
      false,
    exists: attributes.firstName?.exists && attributes.lastName?.exists,
  } as UserData);

type DecryptedUsersMap = Omit<
  Map<String, UserAttributes>,
  'set' | 'clear' | 'delete'
>;

const useJoinUsers = (
  onboardings: Onboarding[] | undefined,
  decryptedUsers: DecryptedUsersMap,
) =>
  useMemo<User[] | undefined>(
    () =>
      onboardings?.map((onboarding: Onboarding) => {
        const decryptedData =
          decryptedUsers.get(onboarding.footprintUserId) ||
          ({} as UserAttributes);
        // Create a UserData for every type of DataKind for this user. The UserData contains
        // the value of the attribute if decrypted, otherwise information on whether the value
        // is set for the user and whether we're currently fetching the decrypted value.
        // This object is composed by joining info from previous POST /org/decrypt calls and
        // GET /org/onboardings calls
        const attributes = Object.fromEntries(
          ALL_FIELDS.map((dataKindType: DataKindType) => [
            dataKindType,
            {
              value: decryptedData[dataKindType]?.value,
              isLoading: decryptedData[dataKindType]?.isLoading || false,
              exists:
                decryptedData[dataKindType]?.exists ||
                onboarding.populatedDataKinds.includes(DataKind[dataKindType]),
            } as UserData,
          ]),
        );

        // The status we display for the user is the maximum status of all the onboarding links,
        // or incomplete if there are no onboarding links
        const maxStatus =
          onboarding.onboardingLinks.sort(
            (a, b) => statusToPriority[b.status] - statusToPriority[a.status],
          )[0]?.status || OnboardingStatus.incomplete;

        return {
          footprintUserId: onboarding.footprintUserId,
          status: maxStatus,
          orderingId: onboarding.orderingId,
          initiatedAt: onboarding.startTimestamp,
          attributes,
          onboardingLinks: onboarding.onboardingLinks,
        } as User;
      }),
    [decryptedUsers, onboardings],
  );

export default useJoinUsers;
