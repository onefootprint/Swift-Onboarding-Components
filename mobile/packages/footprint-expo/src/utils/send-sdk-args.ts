import { version } from '../../package.json';
import type { OpenFootprint } from '../footprint.types';

const API_BASE_URL = 'https://api.onefootprint.com';
const NUM_RETRIES = 3;

type SendSdkArgsRequest = {
  kind: 'verify_v1';
  data: Pick<OpenFootprint, 'publicKey' | 'userData' | 'options' | 'l10n'>;
};

type SendSdkArgsResponse = {
  token: string;
  expires_at: string;
};

const camelToSnakeCase = (str: string) =>
  str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

const fixKeys = (fn: Function) => (obj: unknown) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  const entries: unknown[][] = Object.entries(obj).map(([k, v]) => {
    let value;
    if (Array.isArray(v)) {
      value = v.map(fixKeys(fn));
    } else if (Object(v) === v) {
      value = fixKeys(fn)(v);
    } else {
      value = v;
    }

    const entry = [fn(k), value];
    return entry;
  });

  return Object.fromEntries(entries);
};

const convertKeysToSnakeCase = fixKeys(camelToSnakeCase);

const request = (args: unknown) =>
  fetch(`${API_BASE_URL}/org/sdk_args`, {
    method: 'POST',
    headers: {
      'x-fp-client-version': `footprint-expo ${version}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(args),
  });

const sendSdkArgsRecursive = async (
  payload: SendSdkArgsRequest,
  numRetries: number,
): Promise<SendSdkArgsResponse> =>
  request(payload)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      if (numRetries > 0) {
        return sendSdkArgsRecursive(payload, numRetries - 1);
      }
      throw new Error(response.statusText);
    })
    .catch(error => console.error(error.message));

const sendSdkArgs = async ({
  publicKey,
  userData,
  options,
  l10n,
}: SendSdkArgsRequest['data']) => {
  const result = await sendSdkArgsRecursive(
    {
      kind: 'verify_v1',
      data: convertKeysToSnakeCase({
        publicKey,
        userData,
        options,
        l10n,
      }),
    },
    NUM_RETRIES,
  );
  if (!result) {
    console.error(
      'Footprint: Could not save sdk args, this could be due to connectivity problems.',
    );
    return undefined;
  }
  return result.token;
};

export default sendSdkArgs;
