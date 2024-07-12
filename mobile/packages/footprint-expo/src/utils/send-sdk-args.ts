import type { VerifyProps } from '../types';
import { API_BASE_URL, SDK_KIND, SDK_NAME, SDK_VERSION } from './constants';
import transformKeys from './transform-keys';

const NUM_RETRIES = 3;

type SendSdkArgsRequest = {
  kind: string;
  data: Pick<
    VerifyProps,
    'publicKey' | 'authToken' | 'bootstrapData' | 'options' | 'l10n'
  >;
  is_components_sdk?: boolean;
};

type SendSdkArgsResponse = {
  token: string;
  expires_at: string;
};

const sendSdkArgsRecursive = async (
  payload: SendSdkArgsRequest,
  numRetries: number,
): Promise<SendSdkArgsResponse> => {
  return fetch(`${API_BASE_URL}/org/sdk_args`, {
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
};

const sendSdkArgs = async (
  data: SendSdkArgsRequest['data'],
  options?: { isComponentSdk?: boolean },
) => {
  const result = await sendSdkArgsRecursive(
    {
      kind: SDK_KIND,
      data: {
        ...transformKeys({
          publicKey: data.publicKey,
          authToken: data.authToken,
          userData: data.bootstrapData,
          options: data.options,
          l10n: data.l10n,
        }),
        is_components_sdk: options?.isComponentSdk,
      },
    },
    NUM_RETRIES,
  );

  return result ? result.token : undefined;
};

export default sendSdkArgs;
