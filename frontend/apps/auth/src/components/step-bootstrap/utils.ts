import { getErrorMessage } from '@onefootprint/request';
import type {
  EmailOrPhoneIdentifier,
  IdentifyRequest,
  IdentifyResponse,
} from '@onefootprint/types';
import type { UseMutationResult } from '@tanstack/react-query';

export type IdentifyResult = IdentifyResponse & {
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
): Promise<IdentifyResult | undefined> =>
  mutation
    .mutateAsync({ identifier })
    .then(res => ({ ...res, successfulIdentifier: identifier }))
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
  asyncFn: (i: EmailOrPhoneIdentifier) => Promise<IdentifyResult | undefined>,
  email?: string,
  phoneNumber?: string,
): Promise<IdentifyResult | undefined> => {
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
