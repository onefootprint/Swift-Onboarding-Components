import { keysToCamelCase, keysToSnakeCase } from './utils/transform-data';

const API_BASE_URL =
  process.env.NODE_ENV === 'development'
    ? 'https://api.dev.onefootprint.com'
    : 'https://api.onefootprint.com';

type Options = {
  baseURL?: string;
  data?: Record<string, unknown>;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  url: string;
} & RequestInit;

function convertToRecordString(
  input: Record<string, unknown>,
): Record<string, string> {
  const output: Record<string, string> = {};
  for (const key in input) {
    if (Object.hasOwnProperty.call(input, key)) {
      output[key] = String(input[key]);
    }
  }
  return output;
}

async function request<T>(options: Options): Promise<T> {
  const {
    baseURL = API_BASE_URL,
    url,
    headers = {},
    params,
    data,
    ...otherOptions
  } = options;

  const snakeCaseData = data ? keysToSnakeCase(data) : undefined;
  const snakeCaseParams = params ? keysToSnakeCase(params) : {};
  const queryParams = new URLSearchParams(
    convertToRecordString(snakeCaseParams),
  );
  const requestHeaders = new Headers({
    'Content-Type': 'application/json',
    Accept: 'application/json',
  });
  Object.entries(headers).forEach(([key, value]) => {
    requestHeaders.set(key, value);
  });

  const response = await fetch(`${baseURL}${url}?${queryParams}`, {
    ...otherOptions,
    headers: requestHeaders,
    body: snakeCaseData ? JSON.stringify(snakeCaseData) : undefined,
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const jsonResponse = await response.json();
  return keysToCamelCase(jsonResponse);
}

export default request;
