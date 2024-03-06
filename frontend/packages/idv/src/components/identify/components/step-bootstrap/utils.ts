import type {
  EmailOrPhoneIdentifier,
  IdentifyRequest,
  IdentifyResponse,
} from '@onefootprint/types';
import type { UseMutationResult } from '@tanstack/react-query';

import { getLogger } from '../../../../utils';

export type IdentifyResult = IdentifyResponse & {
  successfulIdentifier: EmailOrPhoneIdentifier;
};

const { logError } = getLogger('auth-init-bootstrap');

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
      logError('Identifying user by auth token failed in in identify', error);
      return undefined;
    });

export const identify = async (
  asyncFn: (i: EmailOrPhoneIdentifier) => Promise<IdentifyResult | undefined>,
  email?: string,
  phoneNumber?: string,
): Promise<IdentifyResult | undefined> => {
  if (phoneNumber) {
    const result = await asyncFn({ phoneNumber });
    if (result?.user) return result;
  }
  if (email) {
    const result = await asyncFn({ email });
    if (result?.user) return result;
  }
  return undefined;
};
