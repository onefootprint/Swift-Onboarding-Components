import { getErrorMessage } from '@onefootprint/request';
import type {
  ChallengeKind,
  EmailOrPhoneIdentifier,
  IdentifyRequest,
  IdentifyResponse,
} from '@onefootprint/types';
import type { UseMutationResult } from '@tanstack/react-query';

type IdentifyResponseParsed = {
  availableChallengeKinds: ChallengeKind[] | undefined;
  hasSyncablePassKey: boolean;
  isUnverified: boolean;
  successfulIdentifier: EmailOrPhoneIdentifier;
};

export const identifyMutationCaller = async (
  mutation: UseMutationResult<
    IdentifyResponse,
    unknown,
    IdentifyRequest,
    unknown
  >,
  identifier: EmailOrPhoneIdentifier,
): Promise<IdentifyResponseParsed | undefined> =>
  mutation
    .mutateAsync({ identifier })
    .then(res =>
      res.user
        ? {
            isUnverified: res.user.isUnverified,
            availableChallengeKinds: res.user?.availableChallengeKinds,
            hasSyncablePassKey: res.user.hasSyncablePasskey,
            successfulIdentifier: identifier,
          }
        : undefined,
    )
    .catch((error: unknown): undefined => {
      console.error(
        `Identifying user by auth token failed in in identify ${getErrorMessage(
          error,
        )}`,
        'auth-init-bootstrap',
      );
      return undefined;
    });

export const identify = async (
  asyncFn: (
    i: EmailOrPhoneIdentifier,
  ) => Promise<IdentifyResponseParsed | undefined>,
  email?: string,
  phoneNumber?: string,
): Promise<IdentifyResponseParsed | undefined> => {
  if (phoneNumber) {
    const result = await asyncFn({ phoneNumber });
    if (result) return result;
  }
  if (email) {
    const result = await asyncFn({ email });
    if (result) return result;
  }
  return undefined;
};
