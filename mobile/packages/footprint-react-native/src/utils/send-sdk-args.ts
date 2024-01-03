import {
  SDK_KIND,
  SDK_NAME,
  API_BASE_URL,
  SDK_VERSION,
} from 'src/utils/constants';
import type { FootprintVerifyProps } from '../footprint.types';
import transformKeys from './transform-keys';

const NUM_RETRIES = 3;

type SendSdkArgsRequest = {
  kind: string;
  data: Pick<
    FootprintVerifyProps,
    'publicKey' | 'authToken' | 'userData' | 'options' | 'l10n'
  >;
};

type SendSdkArgsResponse = {
  token: string;
  expires_at: string;
};

const request = (args: unknown) =>
  fetch(`${API_BASE_URL}/org/sdk_args`, {
    method: 'POST',
    headers: {
      'x-fp-client-version': `${SDK_NAME} ${SDK_VERSION}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(args),
  });

const sendSdkArgsRecursive = async (
  payload: SendSdkArgsRequest,
  numRetries: number,
  onError: (error: string) => void,
): Promise<SendSdkArgsResponse> =>
  request(payload)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      if (numRetries > 0) {
        return sendSdkArgsRecursive(payload, numRetries - 1, onError);
      }
      throw new Error(response.statusText);
    })
    .catch(error => onError(error.message));

const sendSdkArgs = async (
  data: SendSdkArgsRequest['data'],
  onError: (error: string) => void,
) => {
  const { publicKey, authToken, userData, options, l10n } = data;

  const result = await sendSdkArgsRecursive(
    {
      kind: SDK_KIND,
      data: transformKeys({
        publicKey,
        authToken,
        userData,
        options,
        l10n,
      }),
    },
    NUM_RETRIES,
    onError,
  );

  if (!result) {
    onError(
      'Could not save SDK args, this could be due to connectivity problems.',
    );
    return undefined;
  }
  return result.token;
};

export default sendSdkArgs;
