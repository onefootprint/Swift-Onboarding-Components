import type { FootprintVerifyProps } from '../footprint.types';
import { API_BASE_URL, SDK_NAME, SDK_VERSION } from './constants';
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

const sendSdkArgsRecursive = async (
  payload: SendSdkArgsRequest,
  numRetries: number,
): Promise<SendSdkArgsResponse> =>
  fetch(`${API_BASE_URL}/org/sdk_args`, {
    method: 'POST',
    headers: {
      'x-fp-client-version': `${SDK_NAME} ${SDK_VERSION}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }).then(response => {
    if (response.ok) {
      return response.json();
    }
    if (numRetries > 0) {
      return sendSdkArgsRecursive(payload, numRetries - 1);
    }
    return undefined;
  });

const sendSdkArgs = async (data: SendSdkArgsRequest['data']) => {
  const result = await sendSdkArgsRecursive(
    {
      kind: 'verify_v1',
      data: transformKeys(data),
    },
    NUM_RETRIES,
  );

  return result ? result.token : undefined;
};

export default sendSdkArgs;
