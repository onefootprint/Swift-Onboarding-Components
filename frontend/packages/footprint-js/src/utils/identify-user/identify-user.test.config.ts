import { mockRequest } from '@onefootprint/test-utils';

const baseUrl = process.env.API_BASE_URL ?? '';

export const withIdentifyError = () =>
  mockRequest({
    method: 'post',
    path: `${baseUrl}/hosted/identify`,
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });

export const withIdentify = ({
  userFound,
  availableChallengeKinds,
  hasSyncablePassKey,
  once,
}: {
  userFound?: boolean;
  availableChallengeKinds?: string[];
  hasSyncablePassKey?: boolean;
  once?: boolean;
}) =>
  mockRequest({
    method: 'post',
    path: `${baseUrl}/hosted/identify`,
    once,
    response: {
      user_found: userFound,
      is_unverified: false,
      available_challenge_kinds: availableChallengeKinds,
      has_syncable_pass_key: hasSyncablePassKey,
    },
  });
