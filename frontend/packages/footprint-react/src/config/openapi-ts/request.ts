import { API_BASE_URL, CLIENT_VERSION } from '../config/constants';
import { keysToSnakeCase } from './transform-data';

type Options = Request & {
  baseURL?: string;
  data?: Record<string, unknown>;
  params?: Record<string, unknown>;
  url: string;
  disableCaseConverter?: boolean;
};

function convertToRecordString(input: Record<string, unknown>): Record<string, string> {
  const output: Record<string, string> = {};
  for (const key in input) {
    if (Object.hasOwnProperty.call(input, key)) {
      output[key] = String(input[key]);
    }
  }
  return output;
}

export async function request(options: Options) {
  const { baseURL = API_BASE_URL, url, headers, params, data, disableCaseConverter, ...otherOptions } = options;

  const snakeCaseData = data ? keysToSnakeCase(data, disableCaseConverter) : undefined;
  const snakeCaseParams = params ? keysToSnakeCase(params, disableCaseConverter) : {};
  const queryParams = new URLSearchParams(convertToRecordString(snakeCaseParams));
  const requestHeaders = new Headers({
    'Content-Type': 'application/json',
    'x-fp-client-version': CLIENT_VERSION,
    Accept: 'application/json',
  });

  if (headers) {
    headers.forEach((value, key) => {
      requestHeaders.set(key, value);
    });
  }

  return fetch(`${url}?${queryParams}`, {
    ...otherOptions,
    headers: requestHeaders,
    body: snakeCaseData ? JSON.stringify(snakeCaseData) : undefined,
  });
}

export default request;
